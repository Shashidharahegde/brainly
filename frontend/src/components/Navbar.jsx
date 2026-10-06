import React from "react";
import { Link } from "react-router";
import {PlusIcon} from "lucide-react"
import {Button} from "../components/Button"
function Navbar() {
  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex iteams-center justify-between">
          <Link to={"/"}>
            <h1 className="text-3xl font-bold text-primary font-mono tracking-tight hover:text-secondary">
              Brainly
            </h1>
          </Link>
          <div>

            <Button link="/create" text="Create Note" icon={PlusIcon}></Button>

          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
