export const switchAddress = (address: string) => {
  switch (address) {
    case "0x123...":
      return "REBA";
    case "0x456...":
      return "HYDRA";
      break;

    default:
      break;
  }
};
