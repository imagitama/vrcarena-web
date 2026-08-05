import { SurveyQuestion, SurveyQuestionType } from '@/modules/surveys'
import TextInput from '../text-input'
import Button from '../button'

const SurveyQuestionsEditor = ({
  value,
  onChange,
}: {
  value: SurveyQuestion[]
  onChange: (newVal: SurveyQuestion[]) => void
}) => {
  const onClickAdd = () => {
    onChange(
      value.concat({
        question: 'What is the meaning of life?',
        type: SurveyQuestionType.Text,
      })
    )
  }

  const onQuestionChange = (idx: number, textVal: string) =>
    onChange(
      value.map((questionData, i) =>
        i === idx
          ? {
              ...questionData,
              question: textVal,
            }
          : questionData
      )
    )

  const onMoveUp = (idx: number) => {
    if (idx <= 0) return // already at top
    const newItems = [...value]
    ;[newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]]
    onChange(newItems)
  }

  const onMoveDown = (idx: number) => {
    if (idx >= value.length - 1) return // already at bottom
    const newItems = [...value]
    ;[newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]]
    onChange(newItems)
  }

  return (
    <>
      {value.map((questionData, i) => (
        <div key={i}>
          <TextInput
            label="Question"
            value={questionData.question}
            onChange={(e) => onQuestionChange(i, e.target.value)}
            fullWidth
          />{' '}
          <Button size="small" color="secondary" onClick={() => onMoveUp(i)}>
            Move Up
          </Button>{' '}
          <Button size="small" color="secondary" onClick={() => onMoveDown(i)}>
            Move Down
          </Button>
        </div>
      ))}
      <Button onClick={onClickAdd} color="secondary">
        Add Question
      </Button>
    </>
  )
}

export default SurveyQuestionsEditor
