import { useEffect, useState } from "react";
import axios from "axios";

export const useProfile = () => {
    const [profileId, setProfileId] = useState<string | null>(null);
    const [isOrganization, setIsOrganization] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchProfile = () => {
        axios.get("/api/p")
          .then((response) => {
            setProfileId(response.data.id);
            setIsOrganization(response.data.isOrganization);
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      };
  
      fetchProfile();
    }, []);
  
    return { profileId, isOrganization, isLoading };
  };