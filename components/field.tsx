type Props = { id: string; name: string; label: string; type?: string; autoComplete?: string; defaultValue?: string; required?: boolean; error?: string }

// Error text shows via CSS :user-invalid (only after interaction or a submit attempt).
export function Field({ id, name, label, type = 'text', autoComplete, defaultValue, required = true, error = 'This field is required.' }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label} {required && <span className="text-ember" aria-hidden="true">*</span>}</label>
      <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} defaultValue={defaultValue} maxLength={200} aria-errormessage={`${id}-err`} />
      <p id={`${id}-err`} className="err">{error}</p>
    </div>
  )
}
