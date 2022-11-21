import classNames from "classnames";

export default ({className}) => (<div className="flex justify-center items-center">
  <div className={classNames("spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full", className)} role="status">
    <span className="visually-hidden">Loading...</span>
  </div>
</div>)