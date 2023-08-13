import { RefObject } from "react";
import { useState, useEffect } from "react";

interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value: any;
  onChange?: (...arg: any) => any;
  inputRef?: RefObject<HTMLInputElement>;
  error?: string;
  navigationState?: string;
}

export function FormField({
  htmlFor,
  label,
  type = "text",
  value,
  onChange = () => {},
  inputRef,
  error = "",
  navigationState = "",
}: FormFieldProps) {
  const [errorText, setErrorText] = useState<String>(error);
  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (errorText !== "") setErrorText("");
  };
  useEffect(() => {
    if (navigationState === "idle") {
      setErrorText(error);
    }
  }, [error, navigationState]);
  return (
    <>
      <label htmlFor={htmlFor} className="text-blue-600 font-semibold">
        {label}
      </label>
      <input
        ref={inputRef || undefined}
        onChange={handleOnchange}
        type={type}
        id={htmlFor}
        name={htmlFor}
        className="w-full p-2 rounded-xl my-2"
        value={value}
      />
      <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
        {errorText || ""}
      </div>
    </>
  );
}
