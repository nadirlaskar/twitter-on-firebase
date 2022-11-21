import classNames from "classnames";

export default ({className}) => (<div class="flex justify-center items-center">
  <div className={classNames("spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full", className)} role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>)