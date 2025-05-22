import React from 'react';

export const APP_TITLE = "Valora y Revisa tu Producto";

// SVG Icons
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
    <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.791.56 2.312 1.263a.998.998 0 0 1 .394.81.666.666 0 0 0 .422.546l-.06.035c.342.196.61.457.795.795l.035-.06a.666.666 0 0 0 .546.422.998.998 0 0 1 .81.394c.703.52 1.21 1.345 1.263 2.312a49.52 49.52 0 0 1 0 5.312c-.052.967-.56 1.791-1.263 2.312a.998.998 0 0 1-.81.394.666.666 0 0 0-.422.546l.06.035c-.196.342-.457.61-.795.795l-.035.06a.666.666 0 0 0-.546.422.998.998 0 0 1-.394.81c-.52.703-1.345 1.21-2.312 1.263a49.52 49.52 0 0 1-5.312 0c-.967-.052-1.791-.56-2.312-1.263a.998.998 0 0 1-.394-.81.666.666 0 0 0-.422-.546l.06-.035c.342-.196.61-.457.795-.795l.035.06a.666.666 0 0 0 .546-.422.998.998 0 0 1 .394-.81c.703-.52 1.21-1.345 1.263-2.312a49.52 49.52 0 0 1 0-5.312c.052-.967.56-1.791 1.263-2.312a.998.998 0 0 1 .81-.394.666.666 0 0 0 .422-.546l-.06-.035c.196-.342.457-.61.795-.795l-.035-.06a.666.666 0 0 0 .546-.422.998.998 0 0 1 .394-.81Z" clipRule="evenodd" />
  </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
  </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => ( // Magnifying glass
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
  </svg>
);

export const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => ( // Clipboard
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M10.5 3.75a.75.75 0 0 1 .75.75v2.25h3a.75.75 0 0 1 0 1.5h-3v2.25a.75.75 0 0 1-1.5 0v-2.25H7.5a.75.75 0 0 1 0-1.5h2.25V4.5a.75.75 0 0 1 .75-.75Zm3.75 8.25a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1 0-1.5h7.5Zm.75 2.25a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Zm-.75 3.75a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1 0-1.5h7.5Z" clipRule="evenodd" />
    <path d="M13.5 2.25A2.25 2.25 0 0 0 11.25 0h-6A2.25 2.25 0 0 0 3 2.25v19.5A2.25 2.25 0 0 0 5.25 24h13.5A2.25 2.25 0 0 0 21 21.75V7.543A2.25 2.25 0 0 0 19.406 5.72L14.28 1.594A2.25 2.25 0 0 0 13.5 2.25Zm-1.5 0h-.375a.75.75 0 0 1-.75-.75V1.5h.375a.75.75 0 0 1 .75.75v-.75Zm0 0V.75A.75.75 0 0 0 12.75 0H11.25A2.25 2.25 0 0 0 9 2.25v.015c0 .07.006.137.016.204L12 5.25l2.984-2.985A2.243 2.243 0 0 0 13.5 2.25Z" />
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-4.5a.75.75 0 0 0-.75.75v4.5l1.903-1.903a.75.75 0 0 0-1.06-1.061l-1.904 1.903ZM10.5 4.5a7.5 7.5 0 0 0-7.5 7.5c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5c0-1.061-.215-2.07-.608-3.006a.75.75 0 0 0-1.19.504A5.992 5.992 0 0 1 18 12a6 6 0 0 1-6 6c-3.309 0-6-2.691-6-6a6 6 0 0 1 6-6c1.09 0 2.123.29 3.07.845a.75.75 0 0 0 1.096-.919A7.488 7.488 0 0 0 10.5 4.5Z" clipRule="evenodd" />
  </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={`animate-spin h-5 w-5 text-white ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);


export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002'; // This is for generating images, not for identifying from an image. For identifying from image, use a multimodal model like flash.
export const GEMINI_MULTIMODAL_MODEL = 'gemini-2.5-flash-preview-04-17'; // Correct model for vision tasks