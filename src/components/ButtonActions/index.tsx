import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";


export function ButtonActions({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {

  return <button
    className={
      cn(
        "max-w-36 min-w-36 p-3 rounded-md bg-slate-700 hover:bg-slate-500 font-semibold text-sm",
        className,
      )
    }
    {...props}
  />
}