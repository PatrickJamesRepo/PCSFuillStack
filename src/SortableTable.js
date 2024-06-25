import React, { useState, useEffect, useRef } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSortDown, faSortUp, faFilter } from '@fortawesome/free-solid-svg-icons';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import Switch from 'react-switch';
import axios from 'axios';
import Puurr from './images/puurr.png'
import config from './config.js';


const useClickOutside = (ref, handler) => {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, handler]);
};

const AssetsTable = () => {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [showAttributes, setShowAttributes] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState('f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e');
  const tableRef = useRef(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const attributesDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const [forSale, setForSale] = useState(false);
  const [sortOption, setSortOption] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const POLICY_IDS = [
    { label: 'Original Collection', value: 'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e' },
    { label: 'Halloween Collection', value: '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1' },
    { label: 'PCS/YUMMI Collection', value: 'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c' }
  ];

  const POLICY_ATTRIBUTE_MAP = {
    'f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e': ['Fur', 'Hat', 'Eyes', 'Mask', 'Name', 'Tail', 'Hands', 'Image', 'Mouth', 'Wings', 'Outfit', 'Media', 'Color', 'Collection'],
    '52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1': ['Fur', 'Hat', 'Eyes', 'Mask', 'Name', 'Tail', 'Hands', 'Image', 'Mouth', 'Outfit', 'Media', 'Color', 'Collection'],
    'd91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c': ['Body', 'Eyes', 'Head', 'Name', 'Mouth', 'Image', 'Media']

  };
  

  useEffect(() => {
    setAttributes(POLICY_ATTRIBUTE_MAP[selectedPolicyId]);
  }, [selectedPolicyId]);

  const PAGE_SIZE = 100;

  console.log('selectedPolicyId:', selectedPolicyId);
  console.log('attributes:', attributes);
  
  // Inside the `handleAttributeSelection` function, add a console log to check the selected attribute
  const handleAttributeSelection = (selected) => {
    console.log('Selected attribute:', selected);
    setSelectedAttribute(selected); // Update selected attribute with the selected value
  };
  
  useEffect(() => {
    setAttributes(POLICY_ATTRIBUTE_MAP[selectedPolicyId]);
  }, [selectedPolicyId]);
  

// Inside the useEffect hook for calculating total pages
useEffect(() => {
  const total = assets.length; // Get the total number of assets
  const totalPages = Math.ceil(total / PAGE_SIZE); // Calculate total pages
  console.log('Total assets:', total);
  console.log('Total pages:', totalPages);
  setTotalPages(totalPages); // Update totalPages state
}, [assets]); // Remove PAGE_SIZE from the dependency array

// Inside the handlePageChange function
const handlePageChange = (pageNumber) => {
  console.log('Changing page to:', pageNumber);
  setCurrentPage(pageNumber); // Update currentPage state
};

// Inside the fetchAssets function for the localhost:3001 test server
/*
const fetchAssets = async () => {
  setIsLoading(true);
  try {
    // Fetch assets based on selected policy ID, current page, and page size
    const response = await axios.get(`http://localhost:3001/api/assets/policy/${selectedPolicyId}/Original%20Collection?page=1&count=${PAGE_SIZE}`);
    const { data } = response.data;
    console.log('Received assets:', data);
    setAssets(data); // Update assets state with fetched data
    setIsLoading(false);
  } catch (error) {
    console.error('Failed to fetch assets:', error);
    setError('Failed to fetch assets');
    setIsLoading(false);
  }
};

// Inside the useEffect hook for fetching assets
useEffect(() => {
  console.log('Fetching assets with parameters:', { selectedPolicyId, PAGE_SIZE });
  fetchAssets();
}, [selectedPolicyId]); // Include selectedPolicyId in the dependency array
*/

// Inside fetchAssets for api.puurrty.io production server
const fetchAssets = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${config.apiBaseUrl}/api/assets/policy/${selectedPolicyId}/Original%20Collection?page=1&count=${PAGE_SIZE}`);

    if (response.data && 'data' in response.data) {
      const { data } = response.data;
      console.log('Received assets:', data);
      setAssets(data); // Update assets state with fetched data
    } else {
      console.error('Response does not contain a "data" property:', response);
      setError('Invalid response format');
    }

    setIsLoading(false);
  } catch (error) {
    console.error('Failed to fetch assets:', error.message); // Log the error message
    setError('Failed to fetch assets: ' + error.message); // Update error state with detailed error message
    setIsLoading(false);
  }
};


useEffect(() => {
  console.log('Fetching assets with parameters:', { selectedPolicyId, PAGE_SIZE });
  fetchAssets();
}, [selectedPolicyId]);


  const data = React.useMemo(() => assets, [assets]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Asset',
        accessor: 'id',
        Cell: ({ row }) => (
          <div className="flex items-center" style={{ cursor: 'pointer' }}>
            {row.original.onchain_metadata && row.original.onchain_metadata.image ? (
              <div 
                className="relative"
                style={{ width: '30px', height: '30px' }}
              >
                <img 
                  src={row.original.onchain_metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                  alt="Asset" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', transition: 'transform 0.3s' }} 
                  className="hover:scale-150"
                />
                {row.original.forSale && (
                  <button className="absolute bottom-0 right-0 bg-blue-500 text-white px-2 py-1 rounded">For Sale</button>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            )}
          </div>

        )
      },
      {
        Header: 'Name',
        accessor: 'onchain_metadata.name',
      },
      {
        Header: 'Collection',
        accessor: 'onchain_metadata.collection',
      },
    ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex, pageSize },
    setPageSize,
  } = useTable(
    {
      columns: columns,
      data,
      initialState: { pageIndex: 0, pageSize: PAGE_SIZE }, // Set initial page index and page size
    },
    useGlobalFilter,
    useSortBy // Add useSortBy here to enable sorting functionality
  );


  const handlePolicyIdChange = (selected) => {
    setSelectedPolicyId(selected.value);
  };

  const handleSearch = (e) => {
    const searchQuery = e.target.value;
    setGlobalFilter(searchQuery);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [rowId]: !prevExpandedRows[rowId]
    }));
  };

  useClickOutside(attributesDropdownRef, () => setShowAttributes(false));
  useClickOutside(filterDropdownRef, () => setShowFilter(false));

  return (
    <div ref={tableRef} className="border border-gray-300 rounded-md shadow-sm overflow-y-scroll" style={{ maxHeight: '500px' }}>
      <div className="flex justify-between items-center bg-gray-100 px-4 py-3">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faSearch} className="text-gray-600 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={handleSearch}
            className="border border-gray-300 px-2 py-1 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex items-center">
          <div className="relative inline-block" style={{ color: '#000' }}>
            <button
              className="bg-gray-700 text-white px-4 py-2 text-lg rounded cursor-pointer mr-2 hover:bg-gray-700 hover:text-white border border-transparent transition duration-300 hover:border-green-400 flex items-center"
              onClick={() => setShowAttributes(!showAttributes)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-1" />
              Attributes
            </button>
            {showAttributes && (
               <div ref={attributesDropdownRef} className="absolute bg-white border border-gray-300 mt-1 py-2 px-4 rounded shadow-md">
                 <h3 className="text-lg font-semibold mb-2">Attributes:</h3>
                 <div className="grid grid-cols-2 gap-2">
                   {attributes.map(attribute => (
                     <button 
                       key={attribute}
                       onClick={() => handleAttributeSelection(attribute)} // Update onClick handler
                       className="hover:bg-gray-700 hover:text-white block text-left py-1 cursor-pointer border border-transparent transition duration-300 hover:border-green-400 flex items-center"
                     >
                       {attribute}
                     </button>
                   ))}
                 </div>
               </div>
              )}

          </div>
  
          <div ref={filterDropdownRef} className="relative inline-block">
            <button
              className="bg-gray-700 text-white px-4 py-2 text-lg rounded cursor-pointer mr-2 hover:bg-gray-700 hover:text-white border border-transparent transition duration-300 hover:border-green-400 flex items-center"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-1" />
              Filter
            </button>
            {showFilter && (
              <div className="absolute bg-white border border-gray-300 mt-1 py-2 px-4 rounded shadow-md">
                <div className="flex items-center">
                  <span className="text-black mr-2">For Sale</span>
                  <Switch
                    checked={forSale}
                    onChange={() => setForSale(!forSale)}
                    onColor="#007AFF"
                    onHandleColor="#FFFFFF"
                    handleDiameter={24}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={40}
                  />
                </div>
              </div>
            )}
          </div>
  
          <div className="relative inline-block">
            <div className="inline-flex">
              <button
                className="bg-gray-700 text-white px-4 py-2 text-lg rounded-l cursor-pointer hover:bg-gray-700 hover:text-white border border-transparent transition duration-300 hover:border-green-400"
              >
                <FontAwesomeIcon icon={faSortDown} className="mr-1" />
                Sort
              </button>
              <div className="bg-white border border-gray-300 rounded-r shadow-md">
                <Dropdown options={['Price: Low to High', 'Price: High to Low', 'Reward Ratio']} placeholder="Select an option" />
              </div>
            </div>
          </div>
          <div className="relative inline-block ml-2">
            <Dropdown options={POLICY_IDS} onChange={handlePolicyIdChange} value={selectedPolicyId} placeholder="Select Policy ID" />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading Assets...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <p>{error}</p>
        </div>
      ) : (
        selectedPolicyId && (
          <table {...getTableProps()} className="min-w-full">
            <thead className="bg-gray-200">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer`}
                    >
                      <div className="flex items-center">
                        {column.render('Header')}
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FontAwesomeIcon icon={faSortDown} className="ml-1" />
                          ) : (
                            <FontAwesomeIcon icon={faSortUp} className="ml-1" />
                          )
                        ) : (
                          <FontAwesomeIcon icon={faSortDown} className="ml-1 opacity-0" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {rows.map(row => {
                prepareRow(row);
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      {...row.getRowProps()}
                      className="cursor-pointer"
                      onClick={() => toggleRowExpansion(row.id)} // Toggle expansion when row is clicked
                    >
                      {row.cells.map(cell => (
                        <td
                          {...cell.getCellProps()}
                          className={`px-6 py-4 whitespace-nowrap text-sm`}
                          style={{ color: '#000', backgroundColor: '#fff' }}
                        >
                          <span>{cell.render('Cell')}</span>
                        </td>
                      ))}
                    </tr>
                    {expandedRows[row.id] && ( // Show additional metadata dropdown if row is expanded
                      <tr>
                        <td colSpan={columns.length}>
                          <div className="bg-gray-100 p-4 flex flex-wrap" style={{ color: '#000' }}>
                            <h3 className="text-lg font-semibold mb-2">Additional Metadata:</h3>
                            <div className="flex flex-wrap">
                              {Object.entries(row.original.onchain_metadata).map(([key, value]) => (
                                <div key={key} className="w-1/4 mb-2">
                                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )
      )}

       {/* Pagination Buttons */}
       <div className="flex justify-between items-center my-4">
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
  >
    Previous
  </button>
  <div>
    Page {currentPage} of {totalPages}
  </div>
  <button
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
  >
    Next
  </button>
</div>
    </div>
    
  );
  };
  
  export default AssetsTable;
  