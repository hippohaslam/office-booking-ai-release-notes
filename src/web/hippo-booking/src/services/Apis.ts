import axios from "axios";
import { Area, NewArea } from "../interfaces/Area";
import type { BookingLocation, NewLocation, EditLocation } from "../interfaces/Location";
import { BookableObject } from "../interfaces/Desk";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        window.location.replace("/not-found");
      }
      // intercept 401 only if page is not on /signin
      if (error.response.status === 401 && !window.location.pathname.includes("/signin")) {
        window.location.replace("/signin");
      }
    }
    return Promise.reject(error);
  },
);

function prependAdminToUrl(url: string, admin: boolean) {
  return admin ? `/admin${url}` : url;
}

const getLocationAsync =
  (admin: boolean = false) =>
    async (locationId: string): Promise<BookingLocation> => {
      const url = prependAdminToUrl(`/location/${locationId}`, admin);
      const response = await axiosInstance.get(url);
      return response.data;
    };

const getLocationsAsync =
  (admin: boolean = false) =>
    async (): Promise<BookingLocation[]> => {
      const response = await axiosInstance.get(prependAdminToUrl(`/location`, admin));
      return response.data;
    };

const postNewLocationAsync = async (location: NewLocation) => {
  return await axiosInstance.post(prependAdminToUrl(`/location`, true), location);
};

const editLocationAsync = async (location: EditLocation) => {
  return await axiosInstance.put(prependAdminToUrl(`/location/${location.id}`, true), location);
}

const putObjectsAsync = async (locationId: string, areaId: string, bookableObjects: BookableObject[]) => {
  return await Promise.all(
    bookableObjects.map((bookableObject) =>
      axiosInstance.put(
        prependAdminToUrl(`/location/${locationId}/area/${areaId}/bookable-object/${bookableObject.id}`, true),
        bookableObject,
      ),
    ),
  );
};

const editObjectAsync = async (locationId: string, areaId: string, bookableObject: BookableObject) => {
  return await axiosInstance.put(prependAdminToUrl(`/location/${locationId}/area/${areaId}/bookable-object/${bookableObject.id}`, true), bookableObject);
}

// AREAS

const getLocationAreaAsync =
  (admin: boolean = false) =>
    async (locationId: string, areaId: string): Promise<Area> => {
      const response = await axiosInstance.get(prependAdminToUrl(`/location/${locationId}/area/${areaId}`, admin));
      return response.data;
    };

const postLocationAreaAsync = async (locationId: number, area: NewArea) => {
  return await axiosInstance.post(prependAdminToUrl(`/location/${locationId}/area`, true), area);
};

const putAreaAsync = async (locationId: string, area: Area, areaId: string) => {
  return await axiosInstance.put(prependAdminToUrl(`/location/${locationId}/area/${areaId}`, true), area);
};

/** Combines the locationId with the area data */
const getLocationAreasAsync =
  (admin: boolean = false) =>
    async (locationId: number): Promise<Area[]> => {
      const response = await axiosInstance.get(prependAdminToUrl(`/location/${locationId}/area`, admin));
      response.data.forEach((area: Area) => {
        area.locationId = locationId;
      });
      return response.data;
    };

// BOOKINGS

const getBookingAsync = async (bookingId: number): Promise<Booking> => {
  const response = await axiosInstance.get(`/booking/${bookingId}`);
  return response.data;
};

const getBookingsForUserBetweenDatesAsync = async (from: Date, to: Date): Promise<Booking[]> => {
  const fromString = from.toISOString().split("T")[0];
  const toString = to.toISOString().split("T")[0];
  const response = await axiosInstance.get(`/booking?from=${fromString}&to=${toString}`);
  return response.data;
}

const getUpcomingBookingsAsync = async (): Promise<Booking[]> => {
  const response = await axiosInstance.get(`/booking/upcoming`);
  return response.data;
};

const getBookingsForDateAsync = async (locationId: number, areaId: number, date: Date): Promise<BookedObjects> => {
  const dateString = date.toISOString().split("T")[0];
  const response = await axiosInstance.get(`/booking/location/${locationId}/area/${areaId}/${dateString}`);
  return response.data;
};

const postBookingAsync = async (newBooking: NewBooking): Promise<Booking> => {
  const response = await axiosInstance.post(`/booking`, newBooking);
  return response.data;
};

const deleteBookingAsync = async (bookingId: number) => {
  return await axiosInstance.delete(`/booking/${bookingId}`);
};

// BookableObjects
/** Request to create a new bookable object  */
const postBookableObjectAsync = async (locationId: number, areaId: number, bookableObject: BookableObject) => {
  return await axiosInstance.post(prependAdminToUrl(`/location/${locationId}/area/${areaId}/bookable-object`, true), bookableObject);
};

// AUTH
const getSession = async () => {
  return await axiosInstance.get(`/session`);
};

const postSessionGoogle = async (bearerToken: string) => {
  return await axiosInstance.post(
    `/session/google`,
    {},
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
};

const signUserOut = async () => {
  return await axiosInstance.post(`/session/sign-out`, {});
};

// Reporting
const getReportListAsync = async (): Promise<ReportingList[]> => {
  const result = await axiosInstance.get("/reporting");
  return result.data;
}

const getReportDataAsync = async (reportId: string): Promise<ReportingParams> => {
  const result = await axiosInstance.get(`/reporting/${reportId}`);
  return result.data;
}

const runReportAsync = (reportId: string, params = {}) => {
  const data = axiosInstance.post(`/reporting/${reportId}/run`, params);
  return data;
}

// WaitingList
const addToWaitingListAsync = async (areaId: number, date: Date): Promise<number> => {
  const dateOnly = date.toISOString().split("T")[0];
  const result = await axiosInstance.post("booking/waitlist", { areaId, date: dateOnly });
  return result.data;
}

export const getWaitListBookingsForUserAsync = async (): Promise<WaitingListBookingResponse[]> => {
  const result = await axiosInstance.get("booking/waitlist");
  return result.data;
}

const getWaitingListBookingAsync = async (waitListId: number): Promise<WaitingListBookingResponse> => {
  const result = await axiosInstance.get(`booking/waitlist/${waitListId}`);
  return result.data;
}

/**
 * Get the waiting list for a given area and date. Includes users position in the queue.
 * @param areaId 
 * @param date 
 * @returns 
 */
const getWaitingListAsync = async (areaId: number, date: Date): Promise<WaitingListAreaResponse> => {
  const dateOnly = date.toISOString().split("T")[0];
  const response = await axiosInstance.get(`/booking/waitlist/area/${areaId}/${dateOnly}`);
  return response.data;
}

export const deleteWaitingListBookingAsync = async (waitListId: number): Promise<void> => {
  return await axiosInstance.delete(`booking/waitlist/${waitListId}`);
}

// Admin only
/**
 * Get a list of all bookings for a given location and area in a given date range
 * @param locationId 
 * @param areaId 
 * @param from Date from and including
 * @param to Date up to and including
 */
const getAllBookingWithinAsync = async (locationId: number, areaId: number, from: Date, to: Date): Promise<AdminBooking[]> => {
  const fromString = from.toISOString().split("T")[0];
  const toString = to.toISOString().split("T")[0];
  const response = await axiosInstance.get(`/admin/bookings?locationId=${locationId}&areaId=${areaId}&from=${fromString}&to=${toString}`);
  return response.data;
}

const deleteBookingByAdminAsync = async (bookingId: number) => {
  return await axiosInstance.delete(`/booking/${bookingId}`);
}

export {
  // Locations
  getLocationAsync,
  postNewLocationAsync,
  getLocationAreaAsync,
  getLocationsAsync,
  putObjectsAsync,
  editLocationAsync,
  // AREAS
  getLocationAreasAsync,
  postLocationAreaAsync,
  putAreaAsync,
  // BOOKINGS
  getBookingAsync,
  getUpcomingBookingsAsync,
  getBookingsForUserBetweenDatesAsync,
  getBookingsForDateAsync,
  postBookingAsync,
  deleteBookingAsync,

  // Waiting list
  addToWaitingListAsync,
  getWaitingListBookingAsync,
  getWaitingListAsync,

  // BookableObjects
  postBookableObjectAsync,
  editObjectAsync,
  // AUTH
  getSession,
  postSessionGoogle,
  signUserOut,
  // Reporting
  getReportDataAsync,
  getReportListAsync,
  runReportAsync,
  // Admin
  getAllBookingWithinAsync,
  deleteBookingByAdminAsync
};
