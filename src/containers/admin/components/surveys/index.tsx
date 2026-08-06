import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import EditIcon from '@mui/icons-material/Edit'

import PaginatedView from '@/components/paginated-view'
import {
  CollectionNames,
  editableFields,
  FullSurveyResponse,
  ViewNames,
  FullSurvey,
} from '@/modules/surveys'
import { routes } from '@/routes'
import { getShortId } from '@/utils/formatting'
import StatusText from '@/components/status-text'
import FormattedDate from '@/components/formatted-date'
import NoResultsMessage from '@/components/no-results-message'
import Button, { CreateButton } from '@/components/button'
import { useState } from 'react'
import Dialog from '@/components/dialog'
import GenericEditor from '@/components/generic-editor'
import Heading from '@/components/heading'
import InfoMessage from '@/components/info-message'
import UsernameLink from '@/components/username-link'
import { HydrateFn } from '@/hooks/useDataStore'
import WarningMessage from '@/components/warning-message'
import NoValueLabel from '@/components/no-value-label'

const SurveysRenderer = ({
  items,
  hydrate,
}: {
  items?: FullSurvey[]
  hydrate?: HydrateFn
}) => {
  const [idBeingEdited, setIdBeingEdited] = useState<null | string>(null)
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Questions</TableCell>
            <TableCell>Meta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items!.length ? (
            items!.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell title={survey.id}>
                  #{getShortId(survey.id)}
                </TableCell>
                <TableCell>
                  {survey.isactive ? (
                    <StatusText positivity={1}>
                      Visible To Logged In Users
                    </StatusText>
                  ) : (
                    <StatusText positivity={-1}>
                      Not Visible To Anyone
                    </StatusText>
                  )}
                </TableCell>
                <TableCell>
                  {survey.questions.map((questionData) => (
                    <div key={questionData.question}>
                      {questionData.question} ({questionData.type})
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  Created <FormattedDate date={survey.createdat} /> by{' '}
                  <UsernameLink
                    id={survey.createdby}
                    username={survey.createdbyusername}
                  />
                  <br />
                  <Button
                    color="secondary"
                    size="small"
                    icon={<EditIcon />}
                    onClick={() => setIdBeingEdited(survey.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>
                <NoResultsMessage>No surveys</NoResultsMessage>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {idBeingEdited && (
        <Dialog onClose={() => setIdBeingEdited(null)}>
          <WarningMessage>
            Your questions are stored with every response as plain text. If you
            change a question, any new responses will have the new wording (old
            responses stay the same).
          </WarningMessage>
          <GenericEditor
            collectionName={CollectionNames.Surveys}
            id={idBeingEdited}
            fields={editableFields}
            onDone={() => {
              setIdBeingEdited(null)
              hydrate!()
            }}
          />
        </Dialog>
      )}
    </>
  )
}

const ResponsesRenderer = ({ items }: { items?: FullSurveyResponse[] }) => {
  const [selectedResponseId, setSelectedResponseId] = useState<null | string>(
    null
  )
  const selectedResponse =
    selectedResponseId !== null
      ? items!.find((item) => item.id === selectedResponseId)!
      : null
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Survey</TableCell>
            <TableCell>Meta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items!.length ? (
            items!.map((surveyResponse) => (
              <TableRow key={surveyResponse.id}>
                <TableCell title={surveyResponse.id}>
                  #{getShortId(surveyResponse.id)}
                </TableCell>
                <TableCell>#{getShortId(surveyResponse.survey)}</TableCell>
                <TableCell>
                  <Button
                    color="secondary"
                    size="small"
                    onClick={() => setSelectedResponseId(surveyResponse.id)}>
                    View Answers
                  </Button>
                </TableCell>
                <TableCell>
                  Created <FormattedDate date={surveyResponse.createdat} /> by{' '}
                  <UsernameLink
                    id={surveyResponse.createdby}
                    username={surveyResponse.createdbyusername}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>
                <NoResultsMessage>No survey responses</NoResultsMessage>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {selectedResponse && (
        <Dialog onClose={() => setSelectedResponseId(null)}>
          <Heading>Response #{getShortId(selectedResponse.id)} Answers</Heading>
          {selectedResponse.answers.map((answerData) => (
            <div key={answerData.question}>
              <strong>{answerData.question}</strong>
              <br />
              {answerData.answer || <NoValueLabel>No answer</NoValueLabel>}
            </div>
          ))}
        </Dialog>
      )}
    </>
  )
}

const AdminSurveys = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <InfoMessage title="How Surveys Work" hideId="how_surveys_work">
        When a user logs in and a survey is active and they haven't submitted a
        response, the user will see a message asking them if they want to fill
        out the survey.
      </InfoMessage>
      <Heading variant="h1">Surveys</Heading>
      <PaginatedView<FullSurvey>
        viewName={ViewNames.GetFullSurveys}
        name="admin-surveys"
        sortOptions={[
          {
            label: 'Createdat at',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName={'createdat'}
        urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
          ':tabName',
          'surveys'
        )}
        itemNamePlural="surveys"
        extraControls={[<CreateButton onClick={() => setIsOpen(true)} />]}>
        <SurveysRenderer />
      </PaginatedView>
      {isOpen && (
        <Dialog onClose={() => setIsOpen(false)}>
          <GenericEditor
            collectionName={CollectionNames.Surveys}
            fields={editableFields}
            onDone={() => setIsOpen(false)}
          />
        </Dialog>
      )}
      <br />
      <br />
      <Heading variant="h1">Survey Responses</Heading>
      <PaginatedView<FullSurveyResponse>
        viewName={ViewNames.GetFullSurveyResponses}
        name="admin-survey-responses"
        sortOptions={[
          {
            label: 'Createdat at',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName={'createdat'}
        urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
          ':tabName',
          'surveys'
        )}
        itemNamePlural="survey responses">
        <ResponsesRenderer />
      </PaginatedView>
    </>
  )
}

export default AdminSurveys
