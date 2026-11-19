import clsx from 'clsx'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  className,
  children,
  ...rest
}) {
  return (
    <Tag className={clsx(variants[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}
