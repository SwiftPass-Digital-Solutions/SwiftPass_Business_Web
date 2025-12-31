/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useState, useCallback, FC, LegacyRef } from "react";
import Cropper from "react-easy-crop";
import { readFileToDataUrl } from "@/utils";
import { Button, Modal } from "@/components";
import "./cropper.css";

interface IProps {
  aspectRatio?: number;
  close: () => void;
  imageFile?: string;
  onComplete: (croppedImage: any) => void;
  open?: boolean;
  shape?: "round" | "rect";
  ref?: React.LegacyRef<any>;
}

// eslint-disable-next-line no-undef
const createImage = (url: string): Promise<CanvasImageSource> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  }

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      // resolve(URL.createObjectURL(file));
      resolve(readFileToDataUrl(file as Blob));
    }, "image/jpeg");
  });
};

const ImageCropper: FC<IProps & React.RefAttributes<unknown>> = forwardRef(
  (
    {
      imageFile,
      open,
      close,
      onComplete,
      shape = "round",
      aspectRatio = 1 / 1,
    },
    ref
  ) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedPixelArea: any) => {
      setCroppedAreaPixels(croppedPixelArea);
    }, []);

    const saveCroppedImage = async () => {
      const croppedImage = await getCroppedImg(
        imageFile || "",
        croppedAreaPixels
      );
      onComplete(croppedImage);
      close();
    };

    return (
      <Modal
        open={!!open}
        handleClose={close}
        hideCloseBtn
        transparent
        fullScreen
      >
        {open && (
          <div className="fixed left-0 top-0 z-20 h-full w-full">
            <button
              type="button"
              className="absolute right-5 top-5 z-40 flex cursor-pointer items-center rounded border-0 bg-gray-300 p-1 outline-none transition-all duration-300 hover:bg-white"
              onClick={() => close()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 36 36"
              >
                <path d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38l2.12 2.12L18 20.12l8.38 8.38 2.12-2.12L20.12 18z" />
              </svg>
            </button>
            <div className="cropper-crop-container">
              <Cropper
                ref={ref as LegacyRef<Cropper>}
                image={imageFile}
                crop={crop}
                zoom={zoom}
                cropShape={shape}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="cropper-controls w-full space-x-2 bg-gray-300 p-4">
              <input
                type="range"
                className="cropper-slider"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <Button text="Done" onClick={() => saveCroppedImage()} />
            </div>
          </div>
        )}
      </Modal>
    );
  }
);

ImageCropper.displayName = "ImageCropper";

export default ImageCropper;
