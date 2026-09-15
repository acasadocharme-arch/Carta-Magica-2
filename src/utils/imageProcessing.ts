/**
 * Utilitário de Processamento Seguro de Fotos e Diretrizes de Privacidade Infantil
 * Em conformidade com a LGPD (Lei nº 13.709/2018 - Art. 14: Tratamento de dados pessoais de crianças)
 * e diretrizes internacionais COPPA.
 */

export interface ProcessedImageResult {
  success: boolean;
  dataUrl?: string;
  width?: number;
  height?: number;
  originalSize?: number;
  compressedSize?: number;
  format?: string;
  error?: string;
}

export const PHOTO_GUIDELINES = {
  allowedFormats: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  maxSizeLabel: "10 MB",
  targetMaxWidth: 1000,
  targetMaxHeight: 1000,
  compressionQuality: 0.85,
  privacyNotice: 
    "A foto da criança é processada localmente no seu navegador para remoção de metadados EXIF/GPS, " +
    "criptografada em trânsito e utilizada única e exclusivamente para a composição da carta, PDF e vídeo " +
    "da sua família. Seus dados nunca são vendidos nem utilizados para treinamento de modelos públicos.",
};

/**
 * Processa a foto enviada pelo usuário:
 * 1. Valida tipo MIME e tamanho do arquivo
 * 2. Carrega no elemento Image
 * 3. Renderiza em HTML5 Canvas, eliminando automaticamente qualquer metadado EXIF (incluindo GPS, modelo de celular e timestamps)
 * 4. Redimensiona proporcionalmente para no máximo 1000x1000 pixels
 * 5. Comprime para JPEG/WebP com qualidade otimizada
 */
export async function processAndSanitizeChildPhoto(file: File): Promise<ProcessedImageResult> {
  // 1. Validação de formato
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isValidFormat = 
    PHOTO_GUIDELINES.allowedFormats.includes(mimeType) ||
    PHOTO_GUIDELINES.allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!isValidFormat) {
    return {
      success: false,
      error: "Formato de imagem não suportado. Por favor, utilize JPG, PNG ou WebP.",
    };
  }

  // 2. Validação de tamanho original
  if (file.size > PHOTO_GUIDELINES.maxSizeBytes) {
    return {
      success: false,
      error: `A imagem excede o tamanho máximo permitido de ${PHOTO_GUIDELINES.maxSizeLabel}. Escolha uma foto menor.`,
    };
  }

  // 3. Leitura e renderização via Canvas para expurgo de EXIF/GPS
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Não foi possível ler o arquivo de imagem. Tente novamente.",
      });
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        resolve({
          success: false,
          error: "O arquivo selecionado parece estar corrompido ou não é uma imagem válida.",
        });
      };

      img.onload = () => {
        try {
          // Cálculo de dimensões respeitando aspect ratio
          let { width, height } = img;
          const maxDim = Math.max(PHOTO_GUIDELINES.targetMaxWidth, PHOTO_GUIDELINES.targetMaxHeight);

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          // Renderização segura no Canvas (elimina todos os metadados binários EXIF/geolocalização da foto)
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({
              success: false,
              error: "Falha ao inicializar o processador gráfico do navegador.",
            });
            return;
          }

          // Fundo branco para imagens com transparência PNG convertidas para JPEG
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);

          // Desenha a imagem sanitizada
          ctx.drawImage(img, 0, 0, width, height);

          // Exporta em JPEG otimizado (tamanho reduzido, sem metadados privados)
          const sanitizedDataUrl = canvas.toDataURL("image/jpeg", PHOTO_GUIDELINES.compressionQuality);
          const approximateCompressedBytes = Math.round((sanitizedDataUrl.length * 3) / 4);

          resolve({
            success: true,
            dataUrl: sanitizedDataUrl,
            width,
            height,
            originalSize: file.size,
            compressedSize: approximateCompressedBytes,
            format: "image/jpeg",
          });
        } catch (err: any) {
          resolve({
            success: false,
            error: "Erro durante o processamento seguro da foto: " + (err?.message || "Tente novamente"),
          });
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
