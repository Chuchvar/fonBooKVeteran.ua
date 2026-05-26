import { FieldErrors } from "react-hook-form";
import { toast } from "react-toastify";
import { IUser } from "../../types/user.type";

interface RegisterErrorsProps {
  errors: FieldErrors<IUser>;
}

export function RegisterErrors({ errors }: RegisterErrorsProps) {
  return (
    <div
      style={{
        position: "absolute",
      }}
    >
      {errors.name?.message &&
        toast.error(errors.name.message, {
          toastId: "",
        })}
      {errors.email?.message &&
        toast.error(errors.email.message, {
          toastId: "",
        })}
      {errors.password?.message &&
        toast.error(errors.password.message, {
          toastId: "",
        })}
    </div>
  );
}
