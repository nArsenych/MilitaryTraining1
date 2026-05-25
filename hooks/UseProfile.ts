import { useEffect, useState } from "react";
import axios from "axios";

export const useProfile = () => {
    const [profileId, setProfileId] = useState<string | null>(null);
    const [isOrganization, setIsOrganization] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      axios.get("/api/p")
        .then((response) => {
          setProfileId(response.data.profileId);
          setIsOrganization(response.data.isOrganization);
          setIsAdmin(response.data.isAdmin ?? false);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, []);

    return { profileId, isOrganization, isAdmin, isLoading };
};
