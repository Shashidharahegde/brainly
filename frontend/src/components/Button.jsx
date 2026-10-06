import { Link } from "react-router";

export function Button({ link, text, icon: Icon }) {
  return (
    <Link to={link} className="btn btn-primary">
      {Icon && <Icon className="size-5" />}
      <span>{text}</span>
    </Link>
  );
}
