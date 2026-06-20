import { services } from "../data/services";

export default function BookRedirect() {
  return null;
}

export async function getServerSideProps({ query }) {
  const requestedService = Array.isArray(query.service) ? query.service[0] : query.service;
  const validServiceIds = services.map((service) => service.id);

  if (requestedService && validServiceIds.includes(requestedService)) {
    return {
      redirect: {
        destination: `/booking/${requestedService}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/services",
      permanent: false,
    },
  };
}
