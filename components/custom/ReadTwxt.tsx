"use client"

import dynamic from "next/dynamic";
import { useMemo } from "react";
import 'react-quill-new/dist/quill.snow.css';


const ReadText = ({ value }: { value: string }) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new")),
    []
  );

  return (
    <ReactQuill
      theme="bubble"
      value={value}
      readOnly
    />
  );
};

export default ReadText;