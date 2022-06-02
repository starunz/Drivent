import { useState } from 'react';
import { useEffect } from 'react';

import { TicketModality } from './ticketModality/ticketModality';
import { HostingModality } from './hostingModality/hostingModality';
import { ConfirmationWithHotel } from './confirmation/confirmationWithHotel';
import { ConfirmationNoHotel } from './confirmation/confirmationNoHotel';
import { ConfirmationOnline } from './confirmation/confirmationOnline';
import { StyledTypography } from '../../../components/PersonalInformationForm';
import { ContainerEmptyInfo, EmptyInfoText } from './style';

import { getPersonalInformations } from '../../../services/enrollmentApi';
import useToken from '../../../hooks/useToken';
import { getEventInfo } from '../../../services/eventApi';

export default function Payment() {
  const token = useToken();
  const [haveInfos, setHaveInfos] = useState();
  const [eventInfos, setEventInfos] = useState();
  const [formData, setFormData] = useState({
    eventId: '',
    enrollmentId: '',
    isOnline: '',
    withAccommodation: false,
    totalPrice: ''
  });
  
  const [ selectedTicketModality, setSelectedTicketModality ] = useState({ isPresential: false, isOnline: false });
  const [ activedTicketModality, setActivedTicketModality ] = useState({ isPresentialActived: false, isOnlineActived: false });

  const [ selectedHostingModality, setSelectedHostingModality ] = useState({ isPresential: false, isOnline: false });
  const [ activedHostingModality, setActivedHostingModality ] = useState({ withHotel: false, noHotel: false });
  
  const [ withPresence, setWithPresence ] = useState(false);
  const [ onlineTicket, setOnlineTicket ] = useState(false);
  const [ withHotel, setWithHotel ] = useState(false);
  const [ noHotel, setNoHotel ] = useState(false);
  
  useEffect(() => {
    const promise = getPersonalInformations(token);
    promise
      .then(() => {
        setHaveInfos(true);
      })
      .catch((error) => {
        if(error.status === 404) {
          setHaveInfos(false);
        }
      });
    const promiseEvent = getEventInfo();
    promiseEvent
      .then((response) => {
        setEventInfos(response);
      })
      .catch((error) => {
          
      });
  }, []);

  return(
    <>
      <StyledTypography variant="h4">Ingresso e pagamento</StyledTypography> 
      {!haveInfos ? 
        <ContainerEmptyInfo>
          <EmptyInfoText>
            Você precisa completar sua inscrição antes <br/>
            de prosseguir pra escolha de ingresso
          </EmptyInfoText>
        </ContainerEmptyInfo>
        :
        <TicketModality 
          activedTicketModality={activedTicketModality} 
          setActivedTicketModality={setActivedTicketModality} 
          selectedTicketModality={selectedTicketModality} 
          setSelectedTicketModality={setSelectedTicketModality} 
          setWithPresence={setWithPresence}
          setOnlineTicket={setOnlineTicket}
          setFormData={setFormData}
          formData={formData}
          eventInfos={eventInfos}
          setWithHotel={setWithHotel}
          setNoHotel={setNoHotel}
        />
      }
      {onlineTicket ?
        <ConfirmationOnline 
          setOnlineTicket={setOnlineTicket} 
          eventInfos={eventInfos}
          formData={formData}
        />
        :
        ''
      }
      {withPresence ?
        <HostingModality 
          activedHostingModality={activedHostingModality}
          setActivedHostingModality={setActivedHostingModality}
          selectedHostingModality={selectedHostingModality}
          setSelectedHostingModality={setSelectedHostingModality}
          setFormData={setFormData}
          formData={formData}
          eventInfos={eventInfos}
          setWithHotel={setWithHotel}
          setNoHotel={setNoHotel}
        />
        :
        ''
      }
      {withHotel ? 
        <ConfirmationWithHotel 
          setFormData={setFormData}
          formData={formData}
          eventInfos={eventInfos}
        />
        :
        ''
      }
      {noHotel ?
        <ConfirmationNoHotel
          setFormData={setFormData}
          formData={formData}
          eventInfos={eventInfos}
        />
        :
        ''
      }
    </>
  ); 
}
