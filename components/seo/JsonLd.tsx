import React from 'react'

export default function JsonLd({ data, id }: { data: Record<string, unknown>; id?: string }) {
  const json = JSON.stringify(data)
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
      {...(id ? { id } : {})}
    />
  )
}
