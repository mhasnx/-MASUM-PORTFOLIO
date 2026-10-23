import { useId } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldBaseProps = {
  label: string;
  error?: string;
};

type InputFieldProps = FieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

export function InputField({
  label,
  error,
  className = "",
  ...props
}: InputFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <input
        className={`ui-control ${className}`.trim()}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <p className="ui-field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextareaFieldProps = FieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export function TextareaField({
  label,
  error,
  className = "",
  ...props
}: TextareaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        className={`ui-control ui-textarea ${className}`.trim()}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <p className="ui-field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = FieldBaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
    options: SelectOption[];
  };

export function SelectField({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <select
        className={`ui-control ui-select ${className}`.trim()}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="ui-field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
