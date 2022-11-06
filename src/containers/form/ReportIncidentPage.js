import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import GDPRFormikPopup from '../../components/common/GDPRPopup/GDPRFormikPopup'

import { useLocation } from 'react-router-dom'
import { reportClientIncident } from '../../api/incidents'
import { getPublicReportEvents } from '../../api/events'

import utils from '../../utils/helpers'
import { initVals, validationSchema } from './utils'

import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik'

import Card from '../../components/Card'
import Button from '../../components/common/Button/Button'
import Loading from '../../components/common/Loading/Loading'

import success from '../../images/success.svg'
import logo from '../../images/halo-icon.png'

const toArabic = (text, arabicText, venueType) =>
  venueType === 'arfestival' ? `${text} / ${arabicText}` : text

const LogoFooter = ({ venueType }) => (
  <div className="form__row">
    <p className="form__footer">
      {toArabic('Powered by', 'مدعوم من', venueType)}{' '}
      <img src={logo} alt="Halo" />
    </p>
  </div>
)

const ReportIncidentPage = () => {
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState('')
  const [geolocation, setGeolocation] = useState(null)
  const [openGDPR, setOpenGDPR] = useState(false)
  const [formValues, setFormValues] = useState({})

  const [isLoading, setLoading] = useState(false)
  const [hasFormPosted, setFormPosted] = useState(false)

  const { pathname } = useLocation()
  const [, , venueType, uuid] = pathname.split('/')

  const selectImage = async e => {
    setPhoto('')

    const base64 = await utils.base64EncodeFile(e.target.files[0])

    if (e.target.files[0]) {
      setPhoto(base64.split(';base64,')[1])
    }
  }

  const rejectForm = () => {
    setOpenGDPR(false)
    setError('Must accept GDPR.')
  }

  const postForm = async values => {
    console.log(values)
    setOpenGDPR(false)
    if (uuid) {
      setError('')
      setLoading(true)

      try {
        const { latitude, longitude } = geolocation
        const data = {
          type_value: 'customerService',
          uuid,
          eventId: values.event,
          capture_data: {
            ...values,
            photo,
            location: latitude == 0 && longitude == 0 ? null : { type: 'Point', coordinates: [latitude, longitude] },
          },
        }

        await reportClientIncident(data)

        setFormPosted(true)
      } catch (e) {
        setError(e?.detail || 'Unable to post form.')
      }

      setLoading(false)
    } else {
      setError('Invalid UUID.')
    }
  }
  const GDPR = async values => {
    setFormValues(values)
    setOpenGDPR(true)
  }

  useEffect(() => {
    /*const fetchGeolocation = () => { // Used to check if user is actually at event, disabled temporarily
      if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) =>
            setGeolocation({ latitude, longitude }),
          () =>
            alert(
              'It appears that you are outside the reporting zone for this event, or, your location settings are not enabled. To use this feature, you must enable your location sharing. To do this, go to settings > location/privacy > safari/chrome > and set to ‘allow while using’. Alternatively, please use another reporting method.',
            ),
        )
    }
    fetchGeolocation()*/
    setGeolocation({latitude: 0, longitude: 0})
  }, [])

  useEffect(() => {
    localStorage.setItem('uuid', uuid)
    const fetchPublicReportEvents = async () => {
      const events = await getPublicReportEvents()
      setEvents(events)
    }
    fetchPublicReportEvents()
  }, [uuid])

  return (
    <>
      <GDPRFormikPopup
        openGDPR={openGDPR}
        submitForm={() => postForm()}
        rejectForm={() => rejectForm()}
      />
      <div className="form__wrapper">
        <Card>
          {hasFormPosted ? (
            <>
              <div className="form__confirmation">
                <h1 className='form__title' style={{textAlign: 'center'}}>Your incident has been reported. We will contact you via the number provided if necessary.</h1>

                <img src={success} alt="Tick" />
              </div>
              <LogoFooter venueType={venueType} />
            </>
          ) : (
            <Formik
              onSubmit={postForm}
              initialValues={initVals(venueType)}
              validationSchema={validationSchema(venueType)}
            >
              {({ setFieldValue }) => (
                <Form className="form" autoComplete="off">
                  <h1 className="form__title">
                    {toArabic(
                      'Report an incident',
                      'الإبلاغ عن حادث',
                      venueType,
                    )}
                  </h1>
                  <div className="form__row">
                    {venueType === 'glastonbury' && (
                      <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'red' }}>
                          DO NOT USE FORM TO REPORT NOISE
                        </h3>
                        <h4>
                          Use the following number to report noise complaints:{' '}
                          <a href="tel:01749899631">01749 899 631</a>
                        </h4>
                      </div>
                    )}
                    <label htmlFor="event">
                      {toArabic('Event', 'حدث', venueType)}
                    </label>
                    <Field
                      as="select"
                      name="event"
                      onChange={({ target: { value } }) =>
                        setFieldValue('event', value)
                      }
                    >
                      <option value="">Please select</option>
                      {events.map(event => (
                        <option key={event.object_id} value={event.object_id}>
                          {event.title}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="event"
                    />
                  </div>
                  <div className="form__row">
                    <label htmlFor="edgName">
                      {toArabic('Name', 'اسم', venueType)}
                    </label>
                    <Field
                      type="text"
                      name="edgName"
                      id="edgName"
                      placeholder="John Doe"
                    />
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="edgName"
                    />
                  </div>
                  <>
                    {venueType === 'stadium' && (
                      <>
                        <div className="form__row">
                          <label htmlFor="edgStand">Stand</label>
                          <Field
                            type="text"
                            name="edgStand"
                            id="edgStand"
                            placeholder="Stand Name"
                          />
                          <ErrorMessage
                            component="p"
                            className="form__error"
                            name="edgStand"
                          />
                        </div>
                        <div className="form__row">
                          <label htmlFor="edgBlock">Block</label>
                          <Field
                            type="text"
                            name="edgBlock"
                            id="edgBlock"
                            placeholder="Block Number"
                          />
                          <ErrorMessage
                            component="p"
                            className="form__error"
                            name="edgBlock"
                          />
                        </div>
                        <div className="form__row">
                          <label htmlFor="edgSeat">Seat</label>
                          <Field
                            type="text"
                            name="edgSeat"
                            id="edgSeat"
                            placeholder="Row Number"
                          />
                        </div>
                      </>
                    )}
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="edgSeat"
                    />
                  </>
                  <div className="form__row">
                    <label htmlFor="edgPhoneNumber">
                      {toArabic('Phone number', 'رقم هاتف', venueType)}
                    </label>
                    <p className="form__input-description">
                      {toArabic(
                        "This is how we'll contact you",
                        'هذه هي الطريقة التي سنتصل بك بها',
                        venueType,
                      )}
                    </p>
                    <Field
                      type="text"
                      name="edgPhoneNumber"
                      id="edgPhoneNumber"
                      placeholder="Phone number"
                    />
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="edgPhoneNumber"
                    />
                  </div>
                  <div className="form__row">
                    <label htmlFor="edgMessage">
                      {toArabic('Message', 'رسالة', venueType)}
                    </label>
                    <p className="form__input-description">
                      {toArabic(
                        'Max of 2000 characters',
                        'بحد أقصى 2000 حرف',
                        venueType,
                      )}
                    </p>
                    <Field
                      component="textarea"
                      name="edgMessage"
                      id="edgMessage"
                      placeholder="What would you like to report..."
                    />
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="edgMessage"
                    />
                  </div>
                  <div className="form__inline">
                    <label className="label__inline" htmlFor="canContact">
                      {toArabic(
                        'Would you like to be contacted about this or kept informed?',
                        'هل ترغب في أن يتم الاتصال بك بخصوص هذا الأمر أو أن تبقى على اطلاع بنعم / لا',
                        venueType,
                      )}
                    </label>
                    <Field
                      type="checkbox"
                      name="canContact"
                      id="canContact"
                      className="nice-checkbox"
                    />
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="canContact"
                    />
                  </div>
                  <p className="form__input-description">
                    {toArabic(
                      'If you are in danger, please report to the nearest steward, police or security officer to ask for immediate help.',
                      'إذا كنت في خطر ، يرجى الذهاب إلى أقرب ضابط شرطة وطلب المساعدة',
                      venueType,
                    )}
                  </p>
                  <div className="form__row">
                    <label htmlFor="photo">
                      {toArabic(
                        'Upload photo',
                        `(صورة (التقاط / تحميل')`,
                        venueType,
                      )}
                    </label>
                    <Field name="photo">
                      {({ field }) => (
                        <input
                          id="photo"
                          type="file"
                          accept="image/*"
                          {...field}
                          onChange={e => {
                            field.onChange(e)
                            selectImage(e)
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      component="p"
                      className="form__error"
                      name="photo"
                    />
                  </div>

                  <div className="form__inline">
                    <label className="label__inline" htmlFor="privPolicy">
                      I agree to the  <a href="https://www.halosolutions.com/privacy-policy/">Halo Privacy Policy</a>.
                    </label>
                    <Field
                      type="checkbox"
                      name="privPolicy"
                      id="privPolicy"
                      className="nice-checkbox"
                    />
                  </div>
                  <ErrorMessage
                      component="p"
                      className="form__error"
                      name="privPolicy"
                    />
                  {error && <p className="form__error--submission">{error}</p>}

                  <LogoFooter venueType={venueType} />

                  <div className="form__row">
                    <Button
                      disabled={isLoading}
                      type='submit'
                      //onClick={() => venueType === 'glastonbury' ? setOpenGDPR(true) : postForm()}
                    >
                      {isLoading ? (
                        <Loading />
                      ) : (
                        toArabic('Submit', 'الإرسال', venueType)
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </Card>
      </div>
    </>
  )
}

LogoFooter.propTypes = {
  venueType: PropTypes.string.isRequired,
}

export default ReportIncidentPage
