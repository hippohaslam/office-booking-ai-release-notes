import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useUser } from "../../contexts/UserContext.tsx";
import RelaxingGraphic from "../../assets/relaxed-graphic.svg";
import OfficeGraphic from "../../assets/in-the-office-graphic.svg";
import ErrorGraphic from "../../assets/undraw_not_found_re_bh2e.svg";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingBookingsAsync } from "../../services/Apis.ts";
import { ErrorBanner } from "../../components/banners/ErrorBanner.tsx";
import "./Home.scss";

const Home = () => {
  const userContext = useUser();
  const [graphicSrc, setGraphicSrc] = useState(RelaxingGraphic);

  const { isFetching, data, isSuccess, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: getUpcomingBookingsAsync,
  });

  // Set the graphic based on the state of the query
  useEffect(() => {
    if (isFetching) {
      setGraphicSrc(RelaxingGraphic);
    } else if (isError) {
      setGraphicSrc(ErrorGraphic);
    } else if (isSuccess && data?.length === 0) {
      setGraphicSrc(RelaxingGraphic);
    } else if (isSuccess) {
      setGraphicSrc(OfficeGraphic);
    }
  }, [data?.length, isFetching, isSuccess, isError]);

  // Just returns HTML based on the state of the query
  const cardToShow = () => {
    if (isFetching) {
      return <p>Fetching bookings...</p>;
    } else if (isError) {
      return <ErrorBanner isShown={true} title='Error' errorMessage='Unable to get bookings, please refresh the page' allowClose={false} />;
    } else if (isSuccess && data) {
      const firstBooking = data.at(0);
      if (data.length === 0 || !firstBooking) {
        return <p>You don't have any upcoming bookings.</p>;
      }

      const bookingsToShow = firstBooking ? data.filter((booking) => booking.date === firstBooking.date) : [];

      const formattedDateTime = new Date(firstBooking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      
      const bookingCardHtml = bookingsToShow.length <= 3 ?
          bookingsToShow.map((booking, index) => {
            return <li key={index} className="upcoming-booking-card">
              <ul>
                <li className='bookable-object-item' aria-label='space'>
                  {booking.bookableObject.name}
                </li>
                <li aria-label='location'>{booking.location.name} - {booking.area.name}</li>
              </ul>
            </li>
          }) :
            <li className="upcoming-booking-card">
              <ul>
                <li className='bookable-object-item' aria-label='space'>
                  {bookingsToShow.length} bookings
                </li>
                <li>View in my bookings</li>
              </ul>
            </li>;

      return (
          <div>
            <p>Your next booking is on <b>{formattedDateTime}</b>:</p>
            <ul className="upcoming-booking-list">
              {bookingCardHtml}
            </ul>
          </div>
      );
    } else {
      // This should never happen
      return <p></p>;
    }
  };

  return (
    <div className='page-container'>
      <Helmet>
        <title>Home | Hippo Reserve</title>
      </Helmet>
      <section className='full-width-navy'>
        <div className='hero-container'>
          <div className='hero-content hero-container__medium-height'>
            <h1>Hi {userContext.user?.firstName}</h1>
            {isSuccess ? <div>{cardToShow()}</div> : null}
            <div className="cta-link-group">
              <Link to='/locations' className='cta cta-pink with-arrow'>
                Make a new booking
              </Link>
              <Link to='/bookings' className='cta cta-pink-outline with-arrow'>
                View my bookings
              </Link>
            </div>
          </div>
          <img className='hero-graphic' alt='' src={graphicSrc} />
        </div>
      </section>
      <section className='text-content-container'>
        <h2>Welcome to Hippo Reserve</h2>
        <p>This app is for booking desks, car parking, and dog-of-the-day at the Hippo offices.</p>
        <h3>Need some help?</h3>
        <p>Read the <Link to={"https://docs.google.com/document/d/1E4kAbMA1UscGbuJoytgoPxivgyZfM4sy3uCx4rTPreE/edit?usp=sharing"} target="none">user instructions on Google Drive</Link>.</p>
      </section>
    </div>
  );
};

export default Home;
