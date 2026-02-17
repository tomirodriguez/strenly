interface SessionHeaderRowProps {
  sessionName: string
  colSpan: number
}

/**
 * Session header row that spans the full grid width.
 * Displays training day name (e.g., "DIA 1 - SQUAT DOMINANT").
 */
export function SessionHeaderRow({ sessionName, colSpan }: SessionHeaderRowProps) {
  return (
    <tr className="border-border border-y bg-muted" data-row-type="session-header">
      <td colSpan={colSpan} className="p-0">
        <div className="sticky left-0 w-fit px-4 py-2 font-black text-[11px] text-primary uppercase tracking-[0.15em]">
          {sessionName}
        </div>
      </td>
    </tr>
  )
}
