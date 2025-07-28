'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { US_UNIVERSITIES } from '@/data/universities';
import { COLLEGE_MAJORS } from '@/data/majors';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  image?: string;
  isStudent: boolean;
  profile?: {
    university?: string;
    year?: number;
    major?: string;
    interests?: string[];
    bio?: string;
  };
  createdAt: string;
  lastActive?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    profile: {
      university: '',
      year: undefined as number | undefined,
      major: '',
      interests: [] as string[],
      bio: ''
    }
  });
  const [universitySearch, setUniversitySearch] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const universityRef = useRef<HTMLDivElement>(null);
  const majorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router, mounted]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (universityRef.current && !universityRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false);
      }
      if (majorRef.current && !majorRef.current.contains(event.target as Node)) {
        setShowMajorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          image: data.user.image || '',
          profile: {
            university: data.user.profile?.university || '',
            year: data.user.profile?.year,
            major: data.user.profile?.major || '',
            interests: data.user.profile?.interests || [],
            bio: data.user.profile?.bio || ''
          }
        });
        setImagePreview(data.user.image || null);
        setUniversitySearch(data.user.profile?.university || '');
        setMajorSearch(data.user.profile?.major || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.profile.interests.includes(interest.trim())) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          interests: [...formData.profile.interests, interest.trim()]
        }
      });
    }
  };

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        interests: formData.profile.interests.filter((_, i) => i !== index)
      }
    });
  };

  const filteredUniversities = US_UNIVERSITIES.filter(uni =>
    uni.toLowerCase().includes(universitySearch.toLowerCase())
  ).slice(0, 10);

  const filteredMajors = COLLEGE_MAJORS.filter(major =>
    major.toLowerCase().includes(majorSearch.toLowerCase())
  ).slice(0, 10);

  const selectUniversity = (university: string) => {
    setUniversitySearch(university);
    setFormData({
      ...formData,
      profile: { ...formData.profile, university }
    });
    setShowUniversityDropdown(false);
  };

  const selectMajor = (major: string) => {
    setMajorSearch(major);
    setFormData({
      ...formData,
      profile: { ...formData.profile, major }
    });
    setShowMajorDropdown(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData({
        ...formData,
        image: result
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      image: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile not found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center backdrop-blur-sm bg-white/80 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎓</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MatchApp
          </h1>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  {(imagePreview || user.image) ? (
                    <img src={imagePreview || user.image} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-2 -right-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                    >
                      📷
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.profile?.university && (
                  <p className="text-indigo-600 font-medium">{user.profile.university}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            /* Edit Form */
            <div className="space-y-6">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Image upload section */}
              {imagePreview && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Profile picture preview</p>
                  </div>
                  <button
                    onClick={removeImage}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              <div className="relative" ref={universityRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                <input
                  type="text"
                  value={universitySearch}
                  onChange={(e) => {
                    setUniversitySearch(e.target.value);
                    setShowUniversityDropdown(true);
                  }}
                  onFocus={() => setShowUniversityDropdown(true)}
                  placeholder="Search for your university..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                {showUniversityDropdown && filteredUniversities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUniversities.map((university, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectUniversity(university)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-black"
                      >
                        {university}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={formData.profile.year || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, year: e.target.value ? parseInt(e.target.value) : undefined }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="">Select Year</option>
                    <option value="1">Freshman</option>
                    <option value="2">Sophomore</option>
                    <option value="3">Junior</option>
                    <option value="4">Senior</option>
                    <option value="5">Graduate</option>
                    <option value="6">PhD</option>
                  </select>
                </div>

                <div className="relative" ref={majorRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                  <input
                    type="text"
                    value={majorSearch}
                    onChange={(e) => {
                      setMajorSearch(e.target.value);
                      setShowMajorDropdown(true);
                    }}
                    onFocus={() => setShowMajorDropdown(true)}
                    placeholder="Search for your major..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  {showMajorDropdown && filteredMajors.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredMajors.map((major, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectMajor(major)}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-black"
                        >
                          {major}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add an interest and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addInterest(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.profile.bio}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, bio: e.target.value }
                  })}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Tell others about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.profile.bio?.length || 0}/500 characters
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Profile Display */
            <div className="space-y-6">
              {user.profile?.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{user.profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Academic Info</h3>
                  <div className="space-y-2">
                    {user.profile?.major && (
                      <p className="text-black"><span className="font-medium">Major:</span> {user.profile.major}</p>
                    )}
                    {user.profile?.year && (
                      <p className="text-black"><span className="font-medium">Year:</span> {
                        ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'][user.profile.year - 1]
                      }</p>
                    )}
                  </div>
                </div>

                {user.profile?.interests && user.profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}