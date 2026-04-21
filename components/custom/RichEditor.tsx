import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import { useMemo } from "react";

interface RichEditorProps {
  placeholder: string;
  onChange: (value: string) => void;
  value: string; // Removed optional operator to ensure value is always provided
}

const RichEditor = ({ placeholder, onChange, value = "" }: RichEditorProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    []
  );
  
  return (
    <ReactQuill
      theme="snow"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      modules={{
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['clean']
        ]
      }}
    />
  );
}

export default RichEditor