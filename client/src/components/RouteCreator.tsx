import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RouteCreator = () => {
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAddStop = () => {
    setStops([...stops, '']);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!routeName.trim()) {
      setError('Route name is required');
      return;
    }

    const validStops = stops.filter(stop => stop.trim());
    if (validStops.length < 2) {
      setError('At least two stops are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/bus/routes',
        {
          routeName: routeName.trim(),
          stops: validStops
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Route created successfully');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create route');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Bus Route</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Route Name:</label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter route name"
          />
        </div>

        <div>
          <label className="block mb-2">Stops:</label>
          {stops.map((stop, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={stop}
                onChange={(e) => handleStopChange(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder={`Stop ${index + 1}`}
              />
              {stops.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStop(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddStop}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Stop
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Route
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RouteCreator;