/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useRef,
  useState,
  forwardRef,
  FC,
  LegacyRef,
  useCallback,
  DragEvent,
} from "react";
import ImageCropper from "./ImageCropper";
import "./uploadbox.css";
import { formatFileBytes, readFileToDataUrl } from "@/utils";
// import { useDocumentUploadMutation } from "@/services";
// import { DocTypes } from "@/constants";
import { FileIcon } from "@/assets/svgs";

interface IProps {
  accept?: string;
  aspectRatio?: number;
  disabled?: boolean;
  hasError?: boolean;
  holderShape?: string;
  label?: string;
  desc?: string;
  loading?: boolean;
  maxSize?: number;
  name: string;
  onFile: (file: string | Blob | File | null | undefined) => void;
  removeImage?: (
    setCurrentImage: React.Dispatch<React.SetStateAction<string | null>>,
    setCroppedImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => void;
  shape?: "rect" | "round";
  trim?: boolean;
  returnFile?: boolean;
  useCropper?: boolean;
  onBlur?: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  errorMessage?: string;
}

const UploadBox: FC<IProps & React.RefAttributes<unknown>> = forwardRef(
  (
    {
      aspectRatio,
      accept = ".jpg,.png,.jpeg",
      onFile,
      shape,
      holderShape = null,
      trim = true,
      disabled = false,
      maxSize = 500,
      label,
      desc,
      hasError,
      name,
      loading = false,
      useCropper = true,
      returnFile = false,
      // removeImage = () => {},
    },
    ref
  ) => {
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [avatarModal, setAvatarModal] = useState(false);
    const [fileSizeError, setFileSizeError] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const choosePicture = useRef<any>(null);
    // const cropperRef = useRef(null);

    // const [uploadDoc, { isLoading: uploading }] = useDocumentUploadMutation();
    // const MIME_TYPE_MAP: Record<string, DocTypes> = {
    //   "image/jpeg": DocTypes.jpg,
    //   "image/jpg": DocTypes.jpg,
    //   "image/png": DocTypes.png,
    // };

    const handleAvatarClose = () => {
      setAvatarModal(false);
    };

    // const handleImageUpload = useCallback(
    //   async (file: string | File | Blob | null) => {
    //     if (!file) return;
    //     const documentType =
    //       file instanceof File || file instanceof Blob
    //         ? MIME_TYPE_MAP[file.type]
    //         : undefined;

    //     try {
    //       const response = await uploadDoc({ file, documentType }).unwrap();
    //       if (response?.status) {
    //         onFile(response?.data);
    //       } else {
    //         toast.error(response?.message);
    //       }
    //     } catch (error) {
    //       const message = getErrorMessage(error);
    //       toast.error(message);
    //     }
    //   },
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    //   [MIME_TYPE_MAP, uploadDoc]
    // );

    const handleFileSelectionChange: React.ChangeEventHandler<
      HTMLInputElement
    > = async (event) => {
      const file = event?.target?.files?.[0] as Blob | File;
      setFileSizeError(false);
      setError("");

      if (file?.size > maxSize * 1024) {
        setError("File is above the size limit");
        return setFileSizeError(true);
      }
      setFileName((file as File)?.name);

      if (!useCropper && returnFile) {
        // Don't read as DataURL, just return the File
        return onFile(file); // 👈 return raw File
      }

      const fileData = (await readFileToDataUrl(file)) as string;

      if (returnFile) {
        setCroppedImage(fileData);
        // return handleImageUpload(file);
      }

      if (useCropper) {
        setCurrentImage(fileData);
        return setAvatarModal(true);
      }

      const base64String = fileData.split(",")[1];
      if (trim) {
        return onFile(base64String);
      }
      return onFile(fileData);
    };

    // const handleRemove = () => {
    //   setCroppedImage(null);
    //   setCurrentImage(null);
    //   onFile(null);

    //   removeImage(setCurrentImage, setCroppedImage);
    // };

    const handleCroppedImage = (imgUrl: string) => {
      setCroppedImage(imgUrl);
      const base64String = imgUrl.split(",")[1];
      if (trim) {
        return onFile(base64String);
      }

      return onFile(imgUrl);
    };

    const handleClick: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      // eslint-disable-next-line no-param-reassign
      event.target.value = "";
    };
    // Validate file extension
    const validateFileExtension = useCallback(
      (file: File): boolean => {
        const allowedExtensions = accept
          .split(",")
          .map((ext) => ext.trim().toLowerCase());
        const fileExtension = file.name
          .match(/\.([a-z0-9]+)$/i)?.[1]
          ?.toLowerCase();
        return (
          !!fileExtension && allowedExtensions.includes(`.${fileExtension}`)
        );
      },
      [accept]
    );

    // Handle file drop
    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        setError("");

        const file = e.dataTransfer.files[0];
        if (file) {
          if (!validateFileExtension(file)) {
            setError(`Invalid file type. Allowed extensions: ${accept}`);
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const fileData = reader.result as string;

            if (returnFile) {
              setCroppedImage(fileData);
              // return handleImageUpload(file);
            }

            if (useCropper) {
              setCurrentImage(fileData);
              return setAvatarModal(true);
            }

            const base64String = fileData.split(",")[1];
            if (trim) {
              return onFile(base64String);
            }

            return onFile(fileData);
          };
          reader.readAsDataURL(file);
        }
      },
      [
        accept,
        validateFileExtension,
        onFile,
        trim,
        useCropper,
        // handleImageUpload,
        returnFile,
      ]
    );

    // Prevent default behavior for drag events
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    return (
      <div className="flex flex-col gap-2 font-archivo">
        {/* Upload box */}
        <div className="p-4 bg-white drop-shadow-xs text-center rounded-xl">
          <label htmlFor={name}>
            <div
              ref={ref as LegacyRef<HTMLDivElement>}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
        w-full min-h-[260px]
        rounded-xl border border-dashed
        flex flex-col items-center justify-center
        gap-3 text-center
        transition-colors duration-150
        ${
          isDragging
            ? "border-primary-500 bg-primary-50"
            : "border-[#DCDCDC] bg-[#FAFAFA]"
        }
        ${fileSizeError || hasError || error ? "border-primary-500" : ""}
        ${
          disabled || loading
            ? "pointer-events-none opacity-60"
            : "cursor-pointer"
        }
      `}
            >
              <input
                ref={choosePicture}
                id={name}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileSelectionChange}
                onClick={handleClick as any}
              />

              {/* Icon */}
              <span className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E4E7EC]">
                <FileIcon className="text-[#98A2B3]" />
              </span>

              {/* Main text */}
              {!loading && !fileName && (
                <>
                  <p className="text-sm text-[#344054]">
                    <span className="font-semibold text-primary underline">
                      Upload a file
                    </span>{" "}
                    or drag and drop
                  </p>

                  <p className="text-xs text-[#909090]">
                    {accept.split(",").join(", ").toUpperCase()} up to{" "}
                    {formatFileBytes({ bytes: maxSize * 1000 })}
                  </p>
                </>
              )}

              {/* Uploading */}
              {loading && (
                <p className="text-sm text-[#667085]">Uploading file…</p>
              )}

              {/* File name */}
              {fileName && !loading && (
                <p className="text-sm font-medium text-[#344054]">{fileName}</p>
              )}
            </div>
          </label>
          <div className="pt-4">
            {label && (
              <label
                htmlFor={name}
                className={`text-base text-center font-bold ${
                  fileSizeError || hasError || error
                    ? "text-red"
                    : "text-[#040404]"
                }`}
              >
                {label}
              </label>
            )}

            {desc && (
              <small
                className={`text-xs text-center ${
                  fileSizeError || hasError || error
                    ? "text-primary-500"
                    : "text-[#667085]"
                }`}
              >
                {desc}
              </small>
            )}
          </div>
        </div>

        {/* Error */}
        {error && <small className="text-xs text-primary-500">{error}</small>}

        {/* Image cropper */}
        <ImageCropper
          imageFile={currentImage as string}
          open={avatarModal}
          close={handleAvatarClose}
          shape={shape}
          aspectRatio={aspectRatio}
          onComplete={handleCroppedImage}
        />
      </div>
    );
  }
);

UploadBox.displayName = "UploadBox";

export default UploadBox;
