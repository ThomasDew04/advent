import { useState } from 'react'

function TextDoor({ text }) {
  return <p className="door-text">{text}</p>
}

function PhotoDoor({ image, alt, caption }) {
  return (
    <figure className="door-photo">
      {image ? (
        <img src={image} alt={alt ?? ''} />
      ) : (
        <div className="door-photo-placeholder" aria-hidden="true">
          Foto volgt
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

function QuizDoor({ question, options, answer, explanation }) {
  const [picked, setPicked] = useState(null)
  const solved = picked === answer

  return (
    <div className="door-quiz">
      <p className="door-quiz-question">{question}</p>
      <div className="door-quiz-options">
        {options.map((option, i) => {
          const state = picked === null ? '' : i === answer && solved ? 'is-correct' : i === picked ? 'is-wrong' : ''
          return (
            <button
              key={i}
              className={`door-quiz-option ${state}`}
              onClick={() => setPicked(i)}
              disabled={solved}
            >
              {option}
            </button>
          )
        })}
      </div>
      <p className="door-quiz-feedback" role="status">
        {picked === null ? '' : solved ? explanation || 'Juist!' : 'Helaas, probeer nog eens!'}
      </p>
    </div>
  )
}

const RENDERERS = {
  text: TextDoor,
  photo: PhotoDoor,
  quiz: QuizDoor,
}

function DoorContent({ content }) {
  const Renderer = content && RENDERERS[content.type]
  if (!Renderer) return <p className="door-text">Wat hier in zit, volgt binnenkort…</p>
  return <Renderer {...content} />
}

export default DoorContent
