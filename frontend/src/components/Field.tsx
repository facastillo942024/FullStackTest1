import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightSlot?: ReactNode;
}

export function Field({ label, error, rightSlot, id, ...rest }: FieldProps) {
  const inputId = id ?? rest.name;
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="field__control">
        <input id={inputId} aria-invalid={!!error} {...rest} />
        {rightSlot && <span className="field__right">{rightSlot}</span>}
      </div>
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
