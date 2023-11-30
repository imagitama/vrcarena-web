import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'

import { trackAction } from '../../analytics'
import { colorPalette } from '../../config'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  title: {
    fontSize: '150%',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  description: {
    fontStyle: 'italic',
    fontSize: '80%',
    marginBottom: '1rem',
  },
  icon: {
    display: 'flex',
    fontSize: '100%',
    marginRight: '0.5rem',
    '& svg': {
      fontSize: '100%',
      fill: '#FFF',
      // for vrc icon
      width: '1em',
      height: '1em',
    },
  },
  editIcon: {
    width: '40px',
    height: '40px',
    marginLeft: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'all 100ms',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
  },
  requiredLabel: {
    color: colorPalette.negative,
  },
  cols: {
    display: 'flex',
  },
  col: {
    padding: '1rem',
    // borderRadius: '4px',
    // border: '2px solid rgba(255, 255, 255, 0.2)',
    '&:nth-child(2)': {
      margin: '0 0.25rem',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      border: 'none',
    },
  },
  fullWidth: {
    width: '100%',
  },
  arrowToRightIcon: {
    '& svg': {
      display: 'flex',
      fontSize: '400%',
      color: 'rgba(255, 255, 255, 0.2)',
    },
  },
})

const EditorArea = ({
  // for asset amendment form (not passed in for pedestal upload form which modifies 2 fields)
  fieldName = undefined,
  title,
  description,
  icon: Icon,
  display: Display,
  editor: Editor,
  displayAndEditor: DisplayAndEditor,
  analyticsAction,
  analyticsCategoryName,
  onDone = undefined,
  className = '',
  overrideSave = undefined,
  overrideSaveWithNewFields = undefined,
  isRequired = false,
  isEditable = true,
  fields,
  newFields,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    if (!isEditable) {
      setIsEditorOpen(false)
    }
  }, [isEditable])

  const isTwoColumnLayout =
    newFields && !isEditorOpen && newFields[fieldName] !== undefined

  return (
    <div className={`${classes.root} ${className}`}>
      {title && (
        <div className={classes.title}>
          {Icon && (
            <span className={classes.icon}>
              <Icon />
            </span>
          )}
          {title}&nbsp;
          {isRequired ? (
            <span className={classes.requiredLabel}>(Required)</span>
          ) : null}
          {isEditable && !isEditorOpen && !DisplayAndEditor && (
            <div
              className={classes.editIcon}
              onClick={() => {
                if (analyticsAction) {
                  trackAction(analyticsCategoryName, analyticsAction)
                }

                setIsEditorOpen((currentVal) => !currentVal)
              }}>
              <EditIcon />
            </div>
          )}
        </div>
      )}
      {description && <div className={classes.description}>{description}</div>}
      <div className={classes.cols}>
        <div
          className={`${classes.col} ${
            isTwoColumnLayout ? '' : classes.fullWidth
          }`}>
          {DisplayAndEditor || Editor || Display
            ? React.cloneElement(
                DisplayAndEditor ? (
                  DisplayAndEditor
                ) : isEditorOpen && Editor ? (
                  Editor
                ) : (
                  <Display />
                ),
                isEditorOpen
                  ? {
                      onDone: () => {
                        setIsEditorOpen(false)

                        if (onDone) {
                          onDone()
                        }
                      },
                      onCancel: () => {
                        setIsEditorOpen(false)
                      },
                      ...(overrideSave && fieldName
                        ? {
                            // asset amendment form
                            overrideSave: (newVal) =>
                              overrideSave(fieldName, newVal),
                          }
                        : {}),
                      // sync with gumroad form
                      overrideSaveWithNewFields: overrideSaveWithNewFields
                        ? (newVals) => overrideSaveWithNewFields(newVals)
                        : undefined,
                    }
                  : {
                      value: fields[fieldName],
                      fields,
                    }
              )
            : null}
        </div>
        {isTwoColumnLayout && newFields[fieldName] !== undefined ? (
          <>
            <div className={classes.col}>
              <div className={classes.arrowToRightIcon}>
                <ArrowRightIcon />
              </div>
            </div>
            <div className={`${classes.col} ${classes.rightCol}`}>
              {React.cloneElement(<Display />, {
                value: newFields[fieldName],
                fields: newFields,
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default EditorArea
