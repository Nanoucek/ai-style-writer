import { useRef, useState, type DragEvent } from 'react'
import { parseFile } from '../lib/fileParser'

interface Props {
  onTexts: (texts: string[]) => void
  multiple?: boolean
  label?: string
}

export default function FileDropzone({ onTexts, multiple = true, label = 'Přetáhni soubory nebo klikni' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [error, setError] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setLoading(true)
    setError('')
    const names: string[] = []
    const texts: string[] = []

    for (const file of Array.from(files)) {
      try {
        const text = await parseFile(file)
        texts.push(text)
        names.push(file.name)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chyba při čtení souboru')
      }
    }

    setFileNames((prev) => (multiple ? [...prev, ...names] : names))
    onTexts(texts)
    setLoading(false)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeFile(name: string) {
    setFileNames((prev) => prev.filter((n) => n !== name))
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-brand-500 bg-brand-900/20'
            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
        }`}
      >
        {loading ? (
          <p className="text-gray-400 text-sm">Načítám soubory...</p>
        ) : (
          <>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-gray-600 text-xs mt-1">TXT, DOCX, PDF</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.docx,.pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {fileNames.length > 0 && (
        <ul className="space-y-1">
          {fileNames.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-1.5"
            >
              <span className="text-sm text-gray-300 truncate">{name}</span>
              <button
                onClick={() => removeFile(name)}
                className="text-gray-500 hover:text-red-400 ml-2 text-xs flex-shrink-0"
              >
                Odebrat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
