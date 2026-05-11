"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { 
  Globe, 
  Search, 
  Building2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Calendar,
  MapPin,
  FileBadge,
  Copy,
  Share2,
  ArrowRight,
  History
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import CountrySelect from "../../components/CountrySelect";
import { Modal } from "../../components/Modal";

const API_URL = "/api/v1";

interface Address {
  address_lines: string[];
  city: string | null;
  region: string | null;
  country: string;
  postal_code: string | null;
}

interface Registration {
  initial_registration_date: string | null;
  last_update_date: string | null;
  status: string | null;
  next_renewal_date: string | null;
  registration_authority_entity_id: string | null;
  validation_sources: string | null;
  validation_state: string | null;
}

interface FieldModification {
  field: string;
  previous_value: string | null;
  new_value: string | null;
  modification_date: string | null;
}

interface LEIEntityFull {
  lei: string;
  legal_name: string;
  other_names: { name: string; type: string }[];
  entity_status: string;
  registration_status: string;
  jurisdiction: string;
  category: string;
  legal_address: Address;
  headquarters_address: Address | null;
  registration_authority: any;
  legal_form: any;
  registration: Registration;
  entity_expiration_date: string | null;
  entity_expiration_reason: string | null;
  successor_entity: any;
  parents: any[];
  children: any[];
  modifications: FieldModification[];
}

interface LEIEntity {
  lei: string;
  legal_name: string;
  other_names: { name: string; type: string }[];
  entity_status: string;
  registration_status: string;
  country: string;
  country_code: string;
  city: string | null;
  registration_date: string | null;
  expiration_date: string | null;
  legal_address: string | null;
  full_data?: LEIEntityFull;
}

export default function GlobalSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LEIEntity[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [selectedEntity, setSelectedEntity] = useState<LEIEntity | null>(null);
  const [activeTab, setActiveTab] = useState<string>("current");

  const fetchResults = async (searchPage = 1) => {
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    setError(null);
    const token = localStorage.getItem("amltab_token");

    try {
      let url = `${API_URL}/external-search/lei?query=${encodeURIComponent(query)}&page=${searchPage}&page_size=${pageSize}`;
      if (country) {
        url += `&country=${country}`;
      }

      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/signin");
          return;
        }
        const data = await res.json();
        throw new Error(data.detail || "Failed to fetch results");
      }

      const data = await res.json();
      setResults(data.data);
      setTotal(data.total);
      setPage(searchPage);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(1);
  };

  const handleRunScreen = (entity: LEIEntity) => {
    // Redirect to screening page with pre-filled name and country
    const params = new URLSearchParams();
    params.set("name", entity.legal_name);
    params.set("country", entity.country);
    params.set("type", "entity");
    params.set("lei", entity.lei);
    
    router.push(`/screen?${params.toString()}`);
  };

  useEffect(() => {
    const fetchModifications = async () => {
      if (!selectedEntity || selectedEntity.full_data?.modifications.length! > 0) return;
      
      const token = localStorage.getItem("amltab_token");
      try {
        const res = await fetch(`${API_URL}/external-search/${selectedEntity.lei}/modifications`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const mods = await res.json();
          setResults(prev => prev.map(ent => 
            ent.lei === selectedEntity.lei 
              ? { ...ent, full_data: { ...ent.full_data!, modifications: mods } } 
              : ent
          ));
          // Also update the selected entity so the modal sees it
          setSelectedEntity(prev => prev ? { ...prev, full_data: { ...prev.full_data!, modifications: mods } } : null);
        }
      } catch (err) {
        console.error("Error fetching modifications:", err);
      }
    };

    if (selectedEntity) {
      fetchModifications();
    }
  }, [selectedEntity?.lei]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleArea}>
          <div className={styles.iconWrapper}>
            <Globe size={24} color="#6366f1" />
          </div>
          <div>
            <h1 className={styles.title}>Global Entity Search</h1>
            <p className={styles.subtitle}>Direct integration with GLEIF. Search millions of legal entities worldwide.</p>
          </div>
        </div>
      </header>

      <div className={styles.searchSection}>
        <div className={styles.searchCard}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.inputGroup}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                className={styles.searchInput}
                placeholder="Search by legal name or LEI..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <CountrySelect 
                value={country} 
                onChange={(val) => setCountry(val)} 
                placeholder="Global (All Countries)"
              />
            </div>

            <button type="submit" className={styles.searchBtn} disabled={loading || query.length < 2}>
              {loading ? <LoadingSpinner size="small" /> : "Search Entities"}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.resultsSection}>
        {error && (
          <div className={styles.errorState}>
            <XCircle size={40} color="#ef4444" />
            <p>{error}</p>
          </div>
        )}

        {!loading && results.length === 0 && !error && query && (
          <div className={styles.emptyState}>
            <Info size={40} color="var(--text-secondary)" opacity={0.5} />
            <p>No results found for "{query}"</p>
          </div>
        )}

        {results.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Entity Status</th>
                  <th>Legal Name</th>
                  <th>LEI</th>
                  <th>Reg. Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((entity) => (
                  <tr key={entity.lei}>
                    <td>
                      <div className={styles.countryCell}>
                        <img 
                          src={`https://flagcdn.com/w40/${entity.country_code.toLowerCase()}.png`} 
                          alt={entity.country}
                          className={styles.flagIcon}
                        />
                        <span className={styles.countryName}>{entity.country}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <div className={`${styles.statusDot} ${entity.entity_status === 'ACTIVE' ? styles.dotActive : styles.dotInactive}`} />
                        <span className={styles.statusText}>{entity.entity_status}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.legalName}>{entity.legal_name}</span>
                        {entity.other_names.length > 0 && (
                          <div className={styles.otherNamesArea}>
                            <span className={styles.otherNamesLabel}>Other names:</span>
                            {entity.other_names.slice(0, 2).map((on, i) => (
                              <div key={i} className={styles.otherNameItem}>
                                <span className={styles.otherNameText}>{on.name}</span>
                                <span className={styles.otherNameType}>({on.type})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.leiCell}>
                        <code className={styles.leiText}>{entity.lei}</code>
                        <button 
                          className={styles.copyBtn} 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(entity.lei);
                          }}
                          title="Copy LEI"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <div className={`${styles.statusDot} ${entity.registration_status === 'ISSUED' ? styles.dotActive : styles.dotLapsed}`} />
                        <span className={styles.statusText}>{entity.registration_status}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button 
                          className={styles.viewBtn}
                          onClick={() => {
                            setSelectedEntity(entity);
                            setActiveTab("current");
                          }}
                          title="View Full Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => handleRunScreen(entity)}
                          title="Run AML Screening"
                        >
                          <ShieldCheck size={16} />
                          Screen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn} 
                  disabled={page === 1 || loading}
                  onClick={() => fetchResults(page - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className={styles.pageInfo}>
                  Page <strong>{page}</strong> of {totalPages}
                  <span className={styles.totalCount}>({total} total entities)</span>
                </div>
                <button 
                  className={styles.pageBtn} 
                  disabled={page === totalPages || loading}
                  onClick={() => fetchResults(page + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Entity Modal */}
      {selectedEntity && (
        <Modal 
          isOpen={!!selectedEntity} 
          onClose={() => setSelectedEntity(null)}
          title="LEI Reference Data"
          size="large"
        >
          <div className={styles.portalDetails}>
            <div className={styles.portalHeader}>
              <div className={styles.portalTitleArea}>
                <h1>{selectedEntity.legal_name}</h1>
                <div className={styles.topBadges}>
                  <div className={styles.conformBadge}>
                    <ShieldCheck size={16} color="#10b981" />
                    <span>Policy Conforming</span>
                  </div>
                  <span className={styles.lastUpdate}>as of {new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div className={styles.portalActions}>
                <button 
                  className={activeTab === "current" ? styles.tabBtnActive : styles.tabBtn}
                  onClick={() => setActiveTab("current")}
                >
                  Current Data
                </button>
                <button 
                  className={activeTab === "events" ? styles.tabBtnActive : styles.tabBtn}
                  onClick={() => setActiveTab("events")}
                >
                  Events and Changes
                </button>
                <button 
                  className={activeTab === "xml" ? styles.tabBtnActive : styles.tabBtn}
                  onClick={() => setActiveTab("xml")}
                >
                  Show JSON
                </button>
              </div>
            </div>

            {activeTab === "current" && (
              <>
                <div className={styles.portalSection}>
                  <div className={styles.sectionHeader}>
                    <h3>LEI Code: {selectedEntity.lei}</h3>
                    <button className={styles.hideLink}>Hide</button>
                  </div>
                  <div className={styles.dataGrid}>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>(Primary) Legal Name</span>
                      <span className={styles.dataValueBold}>{selectedEntity.legal_name}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Jurisdiction Of Formation</span>
                      <span className={styles.dataValue}>{selectedEntity.full_data?.jurisdiction}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>General Category</span>
                      <span className={styles.dataValue}>{selectedEntity.full_data?.category}</span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Entity Legal Form</span>
                      <span className={styles.dataValue}>
                        {selectedEntity.full_data?.legal_form?.entityLegalFormCode} - {selectedEntity.full_data?.legal_form?.otherLegalForm || 'Standard'}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Entity Status</span>
                      <div className={styles.statusValue}>
                        <div className={`${styles.statusDot} ${selectedEntity.entity_status === 'ACTIVE' ? styles.dotActive : styles.dotInactive}`} />
                        <span>{selectedEntity.entity_status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.portalSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Addresses</h3>
                    <button className={styles.hideLink}>Hide</button>
                  </div>
                  <div className={styles.addressGrid}>
                    <div className={styles.addressCol}>
                      <h4 className={styles.addressTitle}>Legal</h4>
                      <div className={styles.addressBox}>
                        {selectedEntity.full_data?.legal_address.address_lines.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                        <p>{selectedEntity.full_data?.legal_address.city}</p>
                        <p>{selectedEntity.full_data?.legal_address.postal_code}</p>
                        <p><strong>{selectedEntity.full_data?.legal_address.country}</strong></p>
                      </div>
                    </div>
                    <div className={styles.addressCol}>
                      <h4 className={styles.addressTitle}>Headquarters</h4>
                      <div className={styles.addressBox}>
                        {selectedEntity.full_data?.headquarters_address ? (
                          <>
                            {selectedEntity.full_data.headquarters_address.address_lines.map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                            <p>{selectedEntity.full_data.headquarters_address.city}</p>
                            <p>{selectedEntity.full_data.headquarters_address.postal_code}</p>
                            <p><strong>{selectedEntity.full_data.headquarters_address.country}</strong></p>
                          </>
                        ) : (
                          <p className={styles.muted}>Same as legal address</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.portalSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Registration details</h3>
                    <button className={styles.hideLink}>Hide</button>
                  </div>
                  <div className={styles.dataGrid}>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Registration Date</span>
                      <span className={styles.dataValue}>
                        {selectedEntity.full_data?.registration.initial_registration_date ? new Date(selectedEntity.full_data.registration.initial_registration_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Last Update</span>
                      <span className={styles.dataValue}>
                        {selectedEntity.full_data?.registration.last_update_date ? new Date(selectedEntity.full_data.registration.last_update_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Status</span>
                      <div className={styles.statusValue}>
                        <div className={`${styles.statusDot} ${selectedEntity.registration_status === 'ISSUED' ? styles.dotActive : styles.dotLapsed}`} />
                        <span>{selectedEntity.registration_status}</span>
                      </div>
                    </div>
                    <div className={styles.dataRow}>
                      <span className={styles.dataLabel}>Next Renewal</span>
                      <span className={styles.dataValue}>
                        {selectedEntity.full_data?.registration.next_renewal_date ? new Date(selectedEntity.full_data.registration.next_renewal_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.simplePortalRow}>
                  <span>Direct Parents</span>
                  <button className={styles.showLink}>Show</button>
                </div>
                <div className={styles.simplePortalRow}>
                  <span>Ultimate Parents</span>
                  <button className={styles.showLink}>Show</button>
                </div>
                <div className={styles.simplePortalRow}>
                  <span>Direct Children</span>
                  <button className={styles.showLink}>Show</button>
                </div>
              </>
            )}

            {activeTab === "events" && (
              <div className={styles.modificationsContainer}>
                {selectedEntity.full_data?.modifications && selectedEntity.full_data.modifications.length > 0 ? (
                  <div className={styles.modList}>
                    {selectedEntity.full_data.modifications.map((mod, i) => (
                      <div key={i} className={styles.modItem}>
                        <div className={styles.modHeader}>
                          <span className={styles.modField}>{mod.field.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={styles.modDate}>{new Date(mod.modification_date || '').toLocaleDateString()}</span>
                        </div>
                        <div className={styles.modDiff}>
                          <div className={styles.diffBox}>
                            <span className={styles.diffLabel}>Previous</span>
                            <span className={styles.diffValue}>{mod.previous_value || 'None'}</span>
                          </div>
                          <div className={styles.diffArrow}>→</div>
                          <div className={styles.diffBox}>
                            <span className={styles.diffLabel}>New</span>
                            <span className={styles.diffValue}>{mod.new_value || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyTabContent}>
                    <History size={40} className={styles.mutedIcon} />
                    <h3>No Events Found</h3>
                    <p>No historical event modifications found for this entity in the GLEIF records.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "xml" && (
              <div className={styles.xmlContainer}>
                <pre>{JSON.stringify(selectedEntity.full_data, null, 2)}</pre>
              </div>
            )}

            <div className={styles.portalModalActions}>
              <button className={styles.cancelLink} onClick={() => setSelectedEntity(null)}>Back to search results</button>
              <button 
                className={styles.screenMainBtn}
                onClick={() => {
                  handleRunScreen(selectedEntity);
                  setSelectedEntity(null);
                }}
              >
                Perform AML Screening for {selectedEntity.legal_name}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
