import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { exportSchema, type ExportValues } from '@src/export-schema'

export function ExportForm({ onSubmit }: { onSubmit: (values: ExportValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExportValues>({
    resolver: zodResolver(exportSchema),
    defaultValues: { name: '', email: '', startDate: '', endDate: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>
        Name
        <input {...register('name')} />
      </label>
      {errors.name ? <p role="alert">{errors.name.message}</p> : null}

      <label>
        Email
        <input {...register('email')} />
      </label>
      {errors.email ? <p role="alert">{errors.email.message}</p> : null}

      <label>
        Start date
        <input type="date" {...register('startDate')} />
      </label>
      {errors.startDate ? <p role="alert">{errors.startDate.message}</p> : null}

      <label>
        End date
        <input type="date" {...register('endDate')} />
      </label>
      {errors.endDate ? <p role="alert">{errors.endDate.message}</p> : null}

      <button type="submit">Export</button>
    </form>
  )
}
