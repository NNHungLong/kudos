import React, { useRef, useState } from "react";

import { Avatar } from "@radix-ui/themes";
interface props {
  onChange: (file: File) => any;
  imageUrl?: string;
  fallback?: string;
}

export const ImageUploader = ({ onChange, imageUrl, fallback }: props) => {
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef(null);

  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      onChange(e.currentTarget.files[0]);
    }
  };

  return (
    <div
      ref={dropRef}
      className={`cursor-pointer rounded-full border-4 border-dashed border-rounded transition duration-300 ease-in-out ${
        draggingOver ? "border-gray-500" : "border-transparent"
      }`}
      onDragEnter={() => setDraggingOver(true)}
      onDragLeave={() => setDraggingOver(false)}
      onDrag={preventDefaults}
      onDragStart={preventDefaults}
      onDragEnd={preventDefaults}
      onDragOver={preventDefaults}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <Avatar
        size="5"
        src={imageUrl}
        radius="medium"
        fallback={fallback || "+"}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};
