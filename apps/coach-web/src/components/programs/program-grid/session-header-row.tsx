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
    <tr className="border-border border-y bg-zinc-900/60" data-row-type="session-header">
      <td colSpan={colSpan} className="px-4 py-2 font-black text-[11px] text-primary uppercase tracking-[0.15em]">
        {sessionName}
      </td>
    </tr>
  )
}
