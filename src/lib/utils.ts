import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "react-hot-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sharePdf = async (blobUrl: string, filename: string) => {
  try {
    if (!navigator.share || !navigator.canShare) {
      toast.error('Sharing is not supported on this browser. Please download the file instead.');
      return;
    }
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: 'application/pdf' });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: filename,
        files: [file]
      });
      toast.success('File shared successfully!');
    } else {
      toast.error('Sharing files is not supported on this browser.');
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
