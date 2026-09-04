with open("src/pages/PatientDetails.jsx", "r") as f:
    code = f.read()

# 1. Update PUT payload
code = code.replace("""                prescription: JSON.stringify(newVisit.prescriptionList),""", """                prescriptionList: newVisit.prescriptionList,""")

# 2. Update GET parsing logic
old_get_logic = """                            let parsedList = [{ medicine: '', medium: '', frequency: '' }]
                            try {
                                if (visitToEdit.prescription) {
                                    const parsed = JSON.parse(visitToEdit.prescription)
                                    if (Array.isArray(parsed)) parsedList = parsed
                                    else parsedList = [{ medicine: visitToEdit.prescription, medium: '', frequency: '' }]
                                }
                            } catch (e) {
                                parsedList = [{ medicine: visitToEdit.prescription, medium: '', frequency: '' }]
                            }"""

new_get_logic = """                            let parsedList = [{ medicine: '', medium: '', frequency: '' }]
                            if (visitToEdit.prescriptionList) {
                                if (typeof visitToEdit.prescriptionList === 'string') {
                                    try {
                                        parsedList = JSON.parse(visitToEdit.prescriptionList)
                                    } catch(e) {}
                                } else if (Array.isArray(visitToEdit.prescriptionList)) {
                                    parsedList = visitToEdit.prescriptionList;
                                }
                            }"""

code = code.replace(old_get_logic, new_get_logic)

# 3. Update Rendering logic
old_render = """                        {(() => {
                            try {
                                const list = JSON.parse(visit.prescription);
                                if (Array.isArray(list)) {
                                    return (
                                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                            {list.map((med, i) => (
                                                <li key={i}>
                                                    <strong style={{ color: 'var(--text-main)' }}>{med.medicine}</strong> 
                                                    {med.medium || med.frequency ? ` - ${[med.medium, med.frequency].filter(Boolean).join(', ')}` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }
                            } catch (e) {
                                // Ignore error
                            }
                            return <span> {visit.prescription}</span>;
                        })()}"""

new_render = """                        {(() => {
                            let list = visit.prescriptionList || visit.prescription;
                            if (typeof list === 'string') {
                                try { list = JSON.parse(list); } catch(e) {}
                            }
                            if (Array.isArray(list)) {
                                return (
                                    <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                        {list.map((med, i) => (
                                            <li key={i}>
                                                <strong style={{ color: 'var(--text-main)' }}>{med.medicine}</strong> 
                                                {med.medium || med.frequency ? ` - ${[med.medium, med.frequency].filter(Boolean).join(', ')}` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }
                            return <span> {visit.prescription}</span>;
                        })()}"""

code = code.replace(old_render, new_render)

with open("src/pages/PatientDetails.jsx", "w") as f:
    f.write(code)

