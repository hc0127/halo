import * as Yup from 'yup'

/* initial vals */

const globalInitVals = {
  event: '',
  edgName: '',
  edgPhoneNumber: '',
  edgMessage: '',
  photo: '',
  canContact: false,
  privPolicy: false,
}

const additionalStadiumInitVals = {
  edgStand: '',
  edgBlock: '',
  edgSeat: '',
}

/* validation schema */

const globalValidationSchema = {
  event: Yup.string().required('An event is required'),
  edgName: Yup.string()
    .max(50, 'Must be 50 characters or less')
    .required('Name is required'),
  edgPhoneNumber: Yup.string().required('Phone number is required'),
  edgMessage: Yup.string()
    .max(2000, 'Must be 2000 characters or less')
    .required('Message is required'),
  canContact: Yup.bool(),
  privPolicy: Yup.bool().oneOf([true], 'Must accept privacy policy'),
}

const addiitonalStadiumValidationSchema = {
  edgStand: Yup.string()
    .max(50, 'Must be 50 characters or less')
    .required('Stand is required'),
  edgBlock: Yup.string()
    .max(50, 'Must be 50 characters or less')
    .required('Block is required'),
  edgSeat: Yup.string()
    .max(50, 'Must be 50 characters or less')
    .required('Seat is required'),
}

/* utility helpers */

export const initVals = venueType =>
  ({
    stadium: {
      ...globalInitVals,
      ...additionalStadiumInitVals,
    },
    festival: globalInitVals,
    arfestival: globalInitVals,
    glastonbury: globalInitVals,
  }[venueType])

export const validationSchema = venueType =>
  ({
    stadium: Yup.object().shape({
      ...globalValidationSchema,
      ...addiitonalStadiumValidationSchema,
    }),
    festival: Yup.object().shape(globalValidationSchema),
    arfestival: Yup.object().shape(globalValidationSchema),
    glastonbury: Yup.object().shape(globalValidationSchema),
  }[venueType])

const CustomerSupportSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(20, 'Too Long!')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  assignees: Yup.string()
    .required('Required')
    .notOneOf(['someone_else'], 'Select someone else'),
  priority: Yup.string()
    .required('Required')
    .oneOf(['4', '3', '2', '1'], 'Incorrect value'),
  summary: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
})

export { CustomerSupportSchema }
