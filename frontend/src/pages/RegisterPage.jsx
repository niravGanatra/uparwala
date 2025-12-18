import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            navigate('/login');
        } catch (error) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                <CardDescription className="text-center">
                    Enter your details to create your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="password">Password</label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit">Sign Up</Button>
                    <div className="text-center text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-600 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
};

export default RegisterPage;
