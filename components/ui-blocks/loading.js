import classNames from "classnames";

export default ({ rootStyles, className }) => (<div className={classNames("flex justify-center items-center", rootStyles)}>
  <div className={classNames("spinner-border animate-spin inline-block border-4 rounded-full", className)} role="status">
    <span className="visually-hidden">Loading...</span>
  </div>
</div>)