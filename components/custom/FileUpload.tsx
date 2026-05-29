"use client";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import toast from "react-hot-toast";

interface FileUploadProps {
  value: string;
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
  page: string;
}

const TARGET_RATIO = 16 / 9;
const REJECT_THRESHOLD = 0.25;
const CROP_THRESHOLD = 0.05;

function processImage(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const ratio = img.width / img.height;
        const deviation = Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO;

        if (deviation > REJECT_THRESHOLD) {
          resolve(null);
          return;
        }

        if (deviation <= CROP_THRESHOLD) {
          resolve(file);
          return;
        }

        // Center-crop to 16:9
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
        if (ratio > TARGET_RATIO) {
          srcW = Math.round(img.height * TARGET_RATIO);
          srcX = Math.round((img.width - srcW) / 2);
        } else {
          srcH = Math.round(img.width / TARGET_RATIO);
          srcY = Math.round((img.height - srcH) / 2);
        }

        const canvas = document.createElement("canvas");
        canvas.width = srcW;
        canvas.height = srcH;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

const FileUpload = ({ value, onChange, endpoint, page }: FileUploadProps) => {
  const isImageEndpoint = endpoint === "courseBanner";

  return (
    <div className="flex flex-col gap-2">
      {page === "Edit Course" && value !== "" && (
        <Image
          src={value}
          alt="image"
          width={500}
          height={500}
          className="w-[280px] h-[200px] object-cover rounded-xl"
        />
      )}

      {page === "Edit Section" && value !== "" && (
        <p className="text-sm font-medium">{value}</p>
      )}

      <UploadDropzone
        endpoint={endpoint}
        onBeforeUploadBegin={
          isImageEndpoint
            ? async (files) => {
                const results = await Promise.all(files.map(processImage));
                const valid: File[] = [];
                let anyRejected = false;
                let anyCropped = false;

                results.forEach((result, i) => {
                  if (result === null) {
                    anyRejected = true;
                  } else {
                    if (result !== files[i]) anyCropped = true;
                    valid.push(result);
                  }
                });

                if (valid.length === 0) {
                  toast.error(
                    "Зображення не підходить: формат надто далекий від 16:9. Завантажте горизонтальне фото."
                  );
                  throw new Error("Невідповідний формат зображення");
                }

                if (anyRejected) {
                  toast.error("Деякі файли відхилено через невідповідний формат.");
                } else if (anyCropped) {
                  toast.success("Зображення автоматично обрізано під формат 16:9.");
                }

                return valid;
              }
            : undefined
        }
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: Error) => {
          toast.error(error.message);
        }}
        className="w-[280px] h-[200px]"
      />
    </div>
  );
};

export default FileUpload;
