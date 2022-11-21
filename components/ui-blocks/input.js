import classNames from "classnames";

const Input = ({ frdRef, label, inputClassName, labelClassName, rootClassName, multiline, ...rest }) => {
  const style = classNames(
    "form-control",
    "block",
    "w-full",
    "px-3",
    "py-1.5",
    "text-base",
    "font-normal",
    "text-gray-700",
    "bg-white bg-clip-padding",
    "border border-solid border-gray-300",
    "rounded",
    "transition",
    "ease-in-out",
    "m-0",
    "focus:text-gray-700 focus:bg-white focus:border-sky-300 focus:outline-none focus:!shadow-sky-400",
    inputClassName
  );
  const Input = multiline ? <textarea ref={frdRef} id={label} className={style} rows="3" {...rest} /> : <input  ref={frdRef} className={style} {...rest} />;
  return (
    <div className={classNames("form-floating mb-3 group", rootClassName)}>
      {Input}
      <label htmlFor={label} className={classNames("text-gray-700 group-focus-within:text-sky-700", labelClassName)}>{label}</label>
    </div>
  )
}

export default Input;