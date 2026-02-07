import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProfessionSelector = ({ 
  selectedDomain, 
  selectedField, 
  selectedSpecialty, 
  onDomainChange, 
  onFieldChange, 
  onSpecialtyChange,
  disabled = false 
}) => {
  const [domains, setDomains] = useState([]);
  const [fields, setFields] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for "Other" options
  const [useOtherDomain, setUseOtherDomain] = useState(false);
  const [useOtherField, setUseOtherField] = useState(false);
  const [useOtherSpecialty, setUseOtherSpecialty] = useState(false);
  const [otherDomainText, setOtherDomainText] = useState('');
  const [otherFieldText, setOtherFieldText] = useState('');
  const [otherSpecialtyText, setOtherSpecialtyText] = useState('');
  
  // State for search suggestions
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [fieldSuggestions, setFieldSuggestions] = useState([]);
  const [specialtySuggestions, setSpecialtySuggestions] = useState([]);
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [showFieldSuggestions, setShowFieldSuggestions] = useState(false);
  const [showSpecialtySuggestions, setShowSpecialtySuggestions] = useState(false);

  // Load domains on component mount
  useEffect(() => {
    loadDomains();
  }, []);

  // Load fields when domain changes
  useEffect(() => {
    if (selectedDomain && !useOtherDomain) {
      loadFields(selectedDomain);
    } else {
      setFields([]);
      setSpecialties([]);
    }
  }, [selectedDomain, useOtherDomain]);

  // Load specialties when field changes
  useEffect(() => {
    if (selectedField && !useOtherField) {
      loadSpecialties(selectedField);
    } else {
      setSpecialties([]);
    }
  }, [selectedField, useOtherField]);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/professions/domains`);
      setDomains(response.data.data);
    } catch (error) {
      console.error('Error loading domains:', error);
      toast.error('Failed to load profession domains');
    } finally {
      setLoading(false);
    }
  };

  const loadFields = async (domainId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/professions/fields/${domainId}`);
      setFields(response.data.data);
    } catch (error) {
      console.error('Error loading fields:', error);
      toast.error('Failed to load profession fields');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialties = async (fieldId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/professions/specialties/${fieldId}`);
      setSpecialties(response.data.data);
    } catch (error) {
      console.error('Error loading specialties:', error);
      toast.error('Failed to load profession specialties');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainChange = (e) => {
    const domainId = e.target.value;
    if (domainId === 'other') {
      setUseOtherDomain(true);
      onDomainChange('other');
    } else {
      setUseOtherDomain(false);
      setOtherDomainText('');
      onDomainChange(domainId);
    }
    // Reset field and specialty when domain changes
    onFieldChange('');
    onSpecialtyChange('');
    setUseOtherField(false);
    setUseOtherSpecialty(false);
    setOtherFieldText('');
    setOtherSpecialtyText('');
  };

  const handleFieldChange = (e) => {
    const fieldId = e.target.value;
    if (fieldId === 'other') {
      setUseOtherField(true);
      onFieldChange('other');
    } else {
      setUseOtherField(false);
      setOtherFieldText('');
      onFieldChange(fieldId);
    }
    // Reset specialty when field changes
    onSpecialtyChange('');
    setUseOtherSpecialty(false);
    setOtherSpecialtyText('');
  };

  const handleSpecialtyChange = (e) => {
    const specialtyId = e.target.value;
    if (specialtyId === 'other') {
      setUseOtherSpecialty(true);
      onSpecialtyChange('other');
    } else {
      setUseOtherSpecialty(false);
      setOtherSpecialtyText('');
      onSpecialtyChange(specialtyId);
    }
  };

  const handleOtherDomainChange = (e) => {
    const text = e.target.value;
    setOtherDomainText(text);
    onDomainChange(text ? `other:${text}` : 'other');
    
    // Search for suggestions
    if (text.length >= 2) {
      searchProfessions(text, 0, setDomainSuggestions);
      setShowDomainSuggestions(true);
    } else {
      setDomainSuggestions([]);
      setShowDomainSuggestions(false);
    }
  };

  const handleOtherFieldChange = (e) => {
    const text = e.target.value;
    setOtherFieldText(text);
    onFieldChange(text ? `other:${text}` : 'other');
    
    // Search for suggestions
    if (text.length >= 2) {
      searchProfessions(text, 1, setFieldSuggestions);
      setShowFieldSuggestions(true);
    } else {
      setFieldSuggestions([]);
      setShowFieldSuggestions(false);
    }
  };

  const handleOtherSpecialtyChange = (e) => {
    const text = e.target.value;
    setOtherSpecialtyText(text);
    onSpecialtyChange(text ? `other:${text}` : 'other');
    
    // Search for suggestions
    if (text.length >= 2) {
      searchProfessions(text, 3, setSpecialtySuggestions); // Changed to level 3
      setShowSpecialtySuggestions(true);
    } else {
      setSpecialtySuggestions([]);
      setShowSpecialtySuggestions(false);
    }
  };

  const searchProfessions = async (query, level, setSuggestions) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/professions/search`, {
        params: { query, level }
      });
      setSuggestions(response.data.data);
    } catch (error) {
      console.error('Error searching professions:', error);
    }
  };

  const selectSuggestion = (suggestion, type) => {
    switch (type) {
      case 'domain':
        setOtherDomainText(suggestion.name);
        onDomainChange(`other:${suggestion.name}`);
        setShowDomainSuggestions(false);
        break;
      case 'field':
        setOtherFieldText(suggestion.name);
        onFieldChange(`other:${suggestion.name}`);
        setShowFieldSuggestions(false);
        break;
      case 'specialty':
        setOtherSpecialtyText(suggestion.name);
        onSpecialtyChange(`other:${suggestion.name}`);
        setShowSpecialtySuggestions(false);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Domain Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Domain *
        </label>
        
        {!useOtherDomain ? (
          <div className="space-y-2">
            <select
              value={selectedDomain || ''}
              onChange={handleDomainChange}
              disabled={disabled || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a domain</option>
              {domains.map((domain) => (
                <option key={domain.profession_id} value={domain.profession_id}>
                  {domain.name}
                </option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="other-domain-radio"
                name="domain-option"
                checked={useOtherDomain}
                onChange={() => {
                  setUseOtherDomain(true);
                  onDomainChange('other');
                }}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="other-domain-radio" className="text-sm text-gray-700">
                Other (not listed above)
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="listed-domain-radio"
                name="domain-option"
                checked={!useOtherDomain}
                onChange={() => {
                  setUseOtherDomain(false);
                  setOtherDomainText('');
                  onDomainChange('');
                }}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="listed-domain-radio" className="text-sm text-gray-700">
                Choose from list
              </label>
            </div>
            
                         <div className="relative">
               <input
                 type="text"
                 value={otherDomainText}
                 onChange={handleOtherDomainChange}
                 placeholder="Enter your professional domain"
                 disabled={disabled}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
               />
               
               {showDomainSuggestions && domainSuggestions.length > 0 && (
                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                   {domainSuggestions.map((suggestion) => (
                     <div
                       key={suggestion.profession_id}
                       onClick={() => selectSuggestion(suggestion, 'domain')}
                       className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                     >
                       {suggestion.name}
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        )}
      </div>

      {/* Field Selection */}
      {selectedDomain && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Field *
          </label>
          
          {!useOtherField ? (
            <div className="space-y-2">
              <select
                value={selectedField || ''}
                onChange={handleFieldChange}
                disabled={disabled || loading || !selectedDomain || useOtherDomain}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a field</option>
                {fields.map((field) => (
                  <option key={field.profession_id} value={field.profession_id}>
                    {field.name}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="other-field-radio"
                  name="field-option"
                  checked={useOtherField}
                  onChange={() => {
                    setUseOtherField(true);
                    onFieldChange('other');
                  }}
                  disabled={disabled || useOtherDomain}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="other-field-radio" className="text-sm text-gray-700">
                  Other (not listed above)
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  id="listed-field-radio"
                  name="field-option"
                  checked={!useOtherField}
                  onChange={() => {
                    setUseOtherField(false);
                    setOtherFieldText('');
                    onFieldChange('');
                  }}
                  disabled={disabled || useOtherDomain}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="listed-field-radio" className="text-sm text-gray-700">
                  Choose from list
                </label>
              </div>
              
                             <div className="relative">
                 <input
                   type="text"
                   value={otherFieldText}
                   onChange={handleOtherFieldChange}
                   placeholder="Enter your professional field"
                   disabled={disabled || useOtherDomain}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                 />
                 
                 {showFieldSuggestions && fieldSuggestions.length > 0 && (
                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                     {fieldSuggestions.map((suggestion) => (
                       <div
                         key={suggestion.profession_id}
                         onClick={() => selectSuggestion(suggestion, 'field')}
                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                       >
                         {suggestion.name}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      )}

      {/* Specialty Selection */}
      {selectedField && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Specialty *
          </label>
          
          {!useOtherSpecialty ? (
            <div className="space-y-2">
              <select
                value={selectedSpecialty || ''}
                onChange={handleSpecialtyChange}
                disabled={disabled || loading || !selectedField || useOtherDomain || useOtherField}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty.profession_id} value={specialty.profession_id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="other-specialty-radio"
                  name="specialty-option"
                  checked={useOtherSpecialty}
                  onChange={() => {
                    setUseOtherSpecialty(true);
                    onSpecialtyChange('other');
                  }}
                  disabled={disabled || useOtherDomain || useOtherField}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="other-specialty-radio" className="text-sm text-gray-700">
                  Other (not listed above)
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  id="listed-specialty-radio"
                  name="specialty-option"
                  checked={!useOtherSpecialty}
                  onChange={() => {
                    setUseOtherSpecialty(false);
                    setOtherSpecialtyText('');
                    onSpecialtyChange('');
                  }}
                  disabled={disabled || useOtherDomain || useOtherField}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="listed-specialty-radio" className="text-sm text-gray-700">
                  Choose from list
                </label>
              </div>
              
                             <div className="relative">
                 <input
                   type="text"
                   value={otherSpecialtyText}
                   onChange={handleOtherSpecialtyChange}
                   placeholder="Enter your professional specialty"
                   disabled={disabled || useOtherDomain || useOtherField}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                 />
                 
                 {showSpecialtySuggestions && specialtySuggestions.length > 0 && (
                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                     {specialtySuggestions.map((suggestion) => (
                       <div
                         key={suggestion.profession_id}
                         onClick={() => selectSuggestion(suggestion, 'specialty')}
                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                       >
                         {suggestion.name}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          Loading...
        </div>
      )}

      {selectedDomain && selectedField && selectedSpecialty && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected Profession:</strong><br />
            {useOtherDomain ? otherDomainText : domains.find(d => d.profession_id == selectedDomain)?.name} → {' '}
            {useOtherField ? otherFieldText : fields.find(f => f.profession_id == selectedField)?.name} → {' '}
            {useOtherSpecialty ? otherSpecialtyText : specialties.find(s => s.profession_id == selectedSpecialty)?.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessionSelector;
