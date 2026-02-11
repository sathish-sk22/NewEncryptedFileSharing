import {createContext, useState, useEffect} from "react";


 const AuthContext = createContext();

export function AuthProvider({children}) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            setUser({ username: localStorage.getItem("username") });
        }
    }, [token]);

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{token, setToken, user, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    );
}
export default AuthContext;





