import { useEffect, useRef, useState } from "react";

export type Fit = "contain" | "cover";

export default function PhotoCell({
  src,
  onChange,
  onClear,
  fit,
  label,
  missingFileName,
}: {
  src: string | null;
  onChange: (url: string | null) => void;
  onClear: () => void;
  fit: Fit;
  label: string;
  missingFileName: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center overflow-hidden transition-colors ${
        drag ? "bg-[#FFF8D6]" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        loadFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          loadFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {src && failedSrc !== src ? (
        <>
          <img
            src={src}
            alt={label}
            className="h-full w-full"
            style={{ objectFit: fit, padding: fit === "contain" ? "4mm" : 0 }}
            onError={() => setFailedSrc(src)}
          />
          <div className="photo-actions no-print absolute right-1 top-1 flex gap-1 transition-opacity sm:right-2 sm:top-2 sm:gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-white/90 px-1.5 py-1 text-[10px] font-medium text-slate-700 shadow hover:bg-white sm:px-3 sm:py-1.5 sm:text-xs"
            >
              Заменить
            </button>
            <button
              onClick={onClear}
              className="rounded-md bg-red-500/90 px-1.5 py-1 text-[10px] font-medium text-white shadow hover:bg-red-600 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              Удалить
            </button>
          </div>
        </>
      ) : src ? (
        <div className="photo-missing flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
          <svg className="h-8 w-8 text-[#9a9a90]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-sm font-medium text-[#1d1f1b]">{label}</span>
          <span className="text-xs text-[#7b7c73]">Файл пока не найден в папке public/images:</span>
          {missingFileName && <code className="rounded bg-[#f1efe9] px-2 py-1 text-xs text-[#56574f]">{missingFileName}</code>}
          <div className="no-print flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setFailedSrc(null)}
              className="rounded-lg border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-medium text-[#56574f] hover:bg-[#FFF8D6]"
            >
              Проверить снова
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-medium text-[#56574f] hover:bg-[#FFF8D6]"
            >
              Загрузить изображение
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className={`upload-zone no-print flex h-[85%] w-[85%] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors sm:gap-2 ${
            drag ? "upload-zone-active" : ""
          }`}
        >
          <svg className="h-7 w-7 sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-xs font-medium sm:text-sm">{label}</span>
          <span className="upload-zone-hint text-[10px] leading-tight sm:text-xs">Нажмите или перетащите изображение</span>
        </button>
      )}
    </div>
  );
}
