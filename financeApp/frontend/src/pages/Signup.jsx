import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: "",
        birth_date: "",
        location: "",
        savings_goal: 0,
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(form);
        navigate("/login");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <input name="full_name" placeholder="Full Name" onChange={handleChange} />
            <input name="birth_date" type="date" onChange={handleChange} />
            <input name="location" placeholder="Location" onChange={handleChange} />
            <input name="savings_goal" type="number" onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Register</button>
        </form>
    );
};

export default Signup;

