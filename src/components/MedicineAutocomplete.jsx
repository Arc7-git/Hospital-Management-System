import { useState, useEffect, useRef } from 'react'

function MedicineAutocomplete({ value, onChange, token, placeholder }) {
    const [suggestions, setSuggestions] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [highlightIndex, setHighlightIndex] = useState(0)
    const [isInMaster, setIsInMaster] = useState(true)
    const [showMasterBtns, setShowMasterBtns] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const wrapperRef = useRef(null)
    const debounceRef = useRef(null)

    // Fetch suggestions when value changes
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!value || value.trim().length === 0) {
            setSuggestions([])
            setShowDropdown(false)
            setIsInMaster(true)
            setShowMasterBtns(false)
            setDismissed(false)
            return
        }

        debounceRef.current = setTimeout(() => {
            fetch(`http://localhost:5001/medicines?q=${encodeURIComponent(value.trim())}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('API error')
                    return res.json()
                })
                .then(data => {
                    if (!Array.isArray(data)) {
                        setSuggestions([])
                        setShowDropdown(false)
                        setIsInMaster(false)
                        if (!dismissed) setShowMasterBtns(true)
                        return
                    }

                    setSuggestions(data)
                    setHighlightIndex(0)

                    // Check if the exact typed value exists in results
                    const exactMatch = data.some(
                        s => s.toLowerCase() === value.trim().toLowerCase()
                    )
                    setIsInMaster(exactMatch)

                    // Show tick/cross only if not in master and not dismissed
                    if (!exactMatch && value.trim().length > 0) {
                        if (!dismissed) setShowMasterBtns(true)
                    } else {
                        setShowMasterBtns(false)
                    }

                    if (data.length > 0) {
                        setShowDropdown(true)
                    } else {
                        setShowDropdown(false)
                    }
                })
                .catch(() => {
                    setSuggestions([])
                    setShowDropdown(false)
                    // Still show tick/cross since we can't verify if medicine is in master
                    setIsInMaster(false)
                    if (!dismissed && value.trim().length > 0) {
                        setShowMasterBtns(true)
                    }
                })
        }, 300)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [value, token, dismissed])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (name) => {
        onChange(name)
        setShowDropdown(false)
        setShowMasterBtns(false)
        setIsInMaster(true)
        setDismissed(false)
    }

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            handleSelect(suggestions[highlightIndex])
        }
    }

    const handleTickClick = () => {
        // Add to master table silently
        fetch('http://localhost:5001/medicines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: value.trim() })
        }).catch(() => { })

        setShowMasterBtns(false)
        setIsInMaster(true)
        setDismissed(true)
    }

    const handleCrossClick = () => {
        setShowMasterBtns(false)
        setDismissed(true)
    }

    return (
        <div className="medicine-autocomplete-wrapper" ref={wrapperRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                    type="text"
                    className="visit-input"
                    style={{ marginBottom: 0, flex: 1 }}
                    placeholder={placeholder || 'Medicine name'}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
                        setDismissed(false)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowDropdown(true)
                    }}
                />
                {showMasterBtns && !isInMaster && value.trim().length > 0 && (
                    <div className="medicine-master-btns">
                        <button
                            type="button"
                            className="medicine-master-btn tick"
                            onClick={handleTickClick}
                            title="Add to medicine list"
                        >
                            ✓
                        </button>
                        <button
                            type="button"
                            className="medicine-master-btn cross"
                            onClick={handleCrossClick}
                            title="Don't add"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {showDropdown && suggestions.length > 0 && (
                <div className="medicine-dropdown">
                    {suggestions.map((name, i) => (
                        <div
                            key={name}
                            className={`medicine-dropdown-item ${i === highlightIndex ? 'active' : ''}`}
                            onMouseEnter={() => setHighlightIndex(i)}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                handleSelect(name)
                            }}
                        >
                            {name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MedicineAutocomplete
