import { TextField } from '@material-ui/core';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useContext, useState } from 'react';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { Container, Form, PaymentContainer, SubmitContainer, ThirdLine } from './style';
import InputMask from 'react-input-mask';
import Button from '../../../../components/Form/Button';
import { updatePayment } from '../../../../services/ticketApi';
import { toast } from 'react-toastify';
import useToken from '../../../../hooks/useToken';
import UserContext from '../../../../contexts/UserContext';
import dayjs from 'dayjs';

export default function PaymentForm({ setConfirmPayment }) {
  const token = useToken();
  const { userData } = useContext(UserContext);
  const [state, setState] = useState({
    cvc: '',
    expiry: '',
    focus: '',
    name: '',
    number: '',
  });

  const [cardNumberError, setCardNumberError] = useState(false);
  const [cardCVCError, setCardCVCError] = useState(false);
  const [cardNameError, setCardNameError] = useState(false);
  const [cardNameNumberError, setCardNameNumberError] = useState(false);
  const [cardExpiryError, setCardExpiryError] = useState(false);
  const [cardMonthExpiryError, setCardMonthExpiryError] = useState(false);
  const [isLoading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    const isValid = isInputValid();
    if (!isValid) return;

    setLoading(true);
    try {
      await updatePayment(token, userData.user.id);
      setConfirmPayment(true);
      toast.success('Pagamento feito com sucesso!');
      setLoading(false);
    } catch (error) {
      toast.error('Algo deu errado, tente novamente.');
      setLoading(false);
    }
  }

  function nameHasNumbers() {
    const { name } = state;
    let returnedBoolean;

    [...name].forEach(letter => {
      const isLetterANumber = comparingLetterToNumber(letter);
      if (isLetterANumber) {
        returnedBoolean = true;
      } else {
        returnedBoolean = false;
      }
    });

    function comparingLetterToNumber(letter) {
      return letter > 0;
    }

    return returnedBoolean;
  }

  function isMonthValid() {
    const { expiry } = state;

    const SPLIT_INDEX = 0;
    const isMonthBetweenOneAndTwelve = expiry.split('/')[SPLIT_INDEX] > 12;

    if (isMonthBetweenOneAndTwelve) {
      return true;
    } else {
      return false;
    }
  }

  function isExpiryDateValid() {
    const { expiry } = state;

    const YEAR_LENGTH = 2;
    const isYearInvalid = expiry.split('/')[1].length !== YEAR_LENGTH;

    if (isYearInvalid) return true;

    let dateToday = dayjs();

    const isExpiryDateInvalid = dayjs(expiry, 'MM/YY').isBefore(dateToday, 'MM/YY');

    if (isExpiryDateInvalid) return true;

    return false;
  }

  function isInputValid() {
    let message = '';

    const MIN_CARD_NUMBER_LENGTH = 19;
    if (state.number.length < MIN_CARD_NUMBER_LENGTH) {
      setCardNumberError(true);
      message = 'Número do cartão precisa ter 16 digitos!';
    } else {
      setCardNumberError(false);
    }

    const MIN_CVC_LENGTH = 3;
    if (state.cvc.length < MIN_CVC_LENGTH) {
      setCardCVCError(true);
      message = 'CVC precisa ter 3 digitos!';
    } else {
      setCardCVCError(false);
    }

    const MIN_NAME_LENGTH = 5;
    if (state.name.length < MIN_NAME_LENGTH) {
      setCardNameError(true);
      message = 'Nome precisa ter mais que 5 letras!';
    } else {
      setCardNameError(false);
    }

    if (nameHasNumbers()) {
      setCardNameNumberError(true);
      message = 'Nome não pode conter números!';
    } else {
      setCardNameNumberError(false);
    }

    if (isMonthValid()) {
      setCardMonthExpiryError(true);
      message = 'Insira um mês válido entre 1 e 12!';
    } else {
      setCardMonthExpiryError(false);
    }

    if (isExpiryDateValid()) {
      setCardExpiryError(true);
      message = 'Data de expiração precisa ser válida!';
    } else {
      setCardExpiryError(false);
    }

    if (message.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  function handleInputFocus(e) {
    setState({ ...state, focus: e.target.name });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    setState({ ...state, [name]: value });
  }

  return (
    <Container>
      <PaymentContainer id="PaymentForm">
        <Cards
          cvc={state.cvc}
          expiry={state.expiry}
          focused={state.focus}
          name={state.name}
          number={state.number}
        />
        <Form onSubmit={submit}>
          <InputMask
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            mask="9999 9999 9999 9999"
            maskChar=''

          >
            {() =>
              <TextField
                className='cardNumber'
                type="tel"
                name="number"
                placeholder="Card Number"
                variant="outlined"
                helperText={cardNumberError
                  ? 'Número do cartão precisa ter 16 digitos!'
                  : 'E.g.: 49..., 51..., 36..., 37...'
                }
                size="small"
                required
                error={cardNumberError}
              />
            }
          </InputMask>
          <InputMask
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            maskChar=''
          >
            {() =>
              <TextField
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                variant="outlined"
                helperText={cardNameError
                  ? 'Nome precisa ter mais que 5 letras!'
                  : cardNameNumberError
                    ? 'Nome não pode conter números!'
                    : ' '
                }
                pattern='[A-Za-z]'
                size="small"
                autoComplete="off"
                required
                error={cardNameError || cardNameNumberError}
              />
            }
          </InputMask>
          <ThirdLine>
            <InputMask
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              mask='99/99'
              maskChar=''
            >
              {() =>
                <TextField
                  type="expiry"
                  name="expiry"
                  placeholder="Valid Tru"
                  maxLength="5"
                  variant="outlined"
                  helperText={cardMonthExpiryError
                    ? 'Insira um mês válido entre 1 e 12!'
                    : cardExpiryError
                      ? 'Data de expiração precisa ser válida!'
                      : ' '
                  }
                  size="small"
                  required
                  error={cardExpiryError || cardMonthExpiryError}
                />
              }
            </InputMask>
            <InputMask
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              mask="999"
              maskChar=''
            >
              {() =>
                <TextField
                  type="cvc"
                  name="cvc"
                  placeholder="CVC"
                  variant="outlined"
                  helperText={cardCVCError
                    ? 'Mínimo 3 digitos!'
                    : ' '
                  }
                  size="small"
                  required
                  error={cardCVCError}
                />
              }
            </InputMask>
          </ThirdLine>
          <SubmitContainer>
            {!isLoading ?
              <Button sx={{ paddingTop: 10 }} type="submit">
                Finalizar Pagamento
              </Button>
              :
              <LoadingButton sx={{ width: '194.78px' }} variant='contained' loading loadingPosition="start">
                Finalizando
              </LoadingButton>
            }
          </SubmitContainer>
        </Form>
      </PaymentContainer>
    </Container >
  );
}
