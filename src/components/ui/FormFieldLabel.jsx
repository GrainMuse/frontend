export default function FormFieldLabel({ children, required = false }) {
  return (
    <span className="field-label-line">
      <span>{children}</span>
      {required && (
        <i
          className="ti ti-asterisk field-requirement is-required"
          aria-hidden="true"
          title="Required"
        />
      )}
    </span>
  );
}
